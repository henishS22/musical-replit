import { Injectable } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import * as fs from 'fs';
import * as ffmpeg from 'fluent-ffmpeg';
import * as path from 'path';
import * as https from 'https';
import * as http from 'http';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MediaService {
  private readonly storage: Storage;
  private readonly bucketName: string;

  constructor(
    private readonly configService: ConfigService
  ) {
    // Initialize the Google Cloud Storage client
    this.storage = new Storage({
      keyFilename: './gcs.json',
    });
    this.bucketName = this.configService.get<string>('AYRSHARE_BUCKET')
  }

  /**
   * Uploads a file to Google Cloud Storage and returns its public URI.
   * @param localFilePath Path of the file on the local system.
   * @param destination Destination path in the bucket.
   * @returns The public URI of the uploaded file.
   */
  async uploadFile(localFilePath: string, destination: string) {
    try {
      const bucket = this.storage.bucket(this.bucketName);

      // Upload the file to Google Cloud Storage
      const [File] = await bucket.upload(localFilePath, { destination });

      await bucket.file(destination).makePublic();

      // Delete the file from local storage
      fs.unlink(localFilePath, () => { });

      return {
        ...File.metadata,
        uri: `https://storage.googleapis.com/${this.bucketName}/${destination}`,
      };
    } catch (error) {
      fs.unlink(localFilePath, () => { });
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Remove file from google cloud storage
   * @param uri The public URI of the uploaded file
   */
  async removeFile(key: string) {
    try {
      const file = this.storage.bucket(this.bucketName).file(key);
      await file.delete();
      return `File ${key} successfully removed.`;
    } catch (error) {
      console.log(`Failed to delete file: ${error.message}`)
      return error
    }
  }

  async extractBucketAndKey(mediaUrl: string): Promise<{ bucketName: string; key: string; }> {
    try {
      const url = new URL(mediaUrl);
      const bucketName = url.pathname.split('/')[1];
      const key = url.pathname.split('/').slice(2).join('/');
      return { bucketName, key };
    } catch (error) {
      return null;
    }
  }

  async audioImage(audioGcsUrl: string, imageUrl: string): Promise<string> {
    const tempDir = path.join(__dirname, '..', '..', 'temp');
    const outputDir = path.join(__dirname, '..', '..', 'output');

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const audioFilePath = path.join(tempDir, `audio-${Date.now()}.mp3`);
    const imagePath = path.join(tempDir, `image-${Date.now()}.jpg`);
    const outputPath = path.join(outputDir, `output-${Date.now()}.mp4`);

    await this.downloadGCSFile(audioGcsUrl, audioFilePath);
    await this.downloadImageToFile(imageUrl, imagePath);
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(imagePath)
        .inputOptions(['-loop', '1'])
        .input(audioFilePath)
        .outputOptions([
          '-c:v libx264',
          '-tune stillimage',
          '-c:a aac',
          '-b:a 192k',
          '-pix_fmt yuv420p',
          '-shortest'
        ])
        .output(outputPath)
        .on('end', () => {
          fs.unlinkSync(audioFilePath);
          fs.unlinkSync(imagePath);
          resolve(outputPath);
        })
        .on('error', (err) => {
          console.error('FFmpeg error:', err);
          reject('Conversion failed');
        })
        .run();
    });
  }

  async downloadImageToFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;
      const file = fs.createWriteStream(dest);
      protocol.get(url, (response) => {
        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download image. Status: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      }).on('error', (err) => {
        fs.unlink(dest, () => reject(err));
      });
    });
  }

  // 🆕 GCS File Downloader
  async downloadGCSFile(gcsUrl: string, destPath: string): Promise<void> {
    const match = gcsUrl.match(/^https:\/\/storage.googleapis.com\/([^/]+)\/(.+)$/);
    if (!match) throw new Error('Invalid GCS URL');

    const [, bucketName, fileName] = match;
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(fileName);

    await file.download({ destination: destPath });
  }

  //api for mobile app 
  async uploadVideo(localFilePath: string) {
    try {
      const bucket = this.storage.bucket(this.configService.get<string>('AYRSHARE_BUCKET'));
      const fileName = path.basename(localFilePath);
      const targetFileName = fileName;
      const file = bucket.file(targetFileName);

      await bucket.upload(localFilePath, {
        destination: targetFileName,
        resumable: false,
      });

      await file.makePublic();

      fs.unlink(localFilePath, () => { });

      return {
        success: true,
        url: `https://storage.googleapis.com/${bucket.name}/${targetFileName}`,
      };
    } catch (error) {
      fs.unlink(localFilePath, () => { });
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}