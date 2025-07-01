import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import axios from 'axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import { Readable } from 'stream';

import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  PinataIpfs,
  PinataIpfsDocument,
  PinataIpfsGroup,
  PinataIpfsGroupDocument,
  StorageAttr,
  UserStorage,
  UserStorageDocument,
} from '@/src/schemas/schemas';

import { StorageType } from '../schemas/utils/enums';

@Injectable()
export class IpfsService {
  private pinataApiUrl = process.env.PINATA_API_URL;
  private pinataApiKey = process.env.PINATA_API_KEY;
  private pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY;
  private readonly pinataGatewayUrl: string = process.env.PINATA_GET_AUDIO_URL;
  private JwtApiKey = process.env.PINATA_JWT_TOKEN;
  private readonly pinataBaseUrl: string = 'https://api.pinata.cloud';
  private userFileSize = 0;

  constructor(
    @InjectModel(PinataIpfs.name)
    private IpfsPinataModel: Model<PinataIpfsDocument>,
    @InjectModel(PinataIpfsGroup.name)
    private IpfsPinataGroupModel: Model<PinataIpfsGroupDocument>,
    @InjectModel(UserStorage.name)
    private userStorageModel: Model<UserStorageDocument>,
  ) {}

  // Method to upload an file to Pinata IPFS
  async uploadAndPinFile(
    owner: string,
    filePath: string,
    fileSize: number,
    storageMap: StorageAttr,
  ): Promise<void> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath));

    const headers = {
      ...form.getHeaders(),
      pinata_api_key: this.pinataApiKey,
      pinata_secret_api_key: this.pinataSecretApiKey,
    };

    try {
      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinFileToIPFS`,
        form,
        { headers },
      );

      //Update user's storage usage
      if (storageMap) {
        this.userFileSize = storageMap.storageUsed + fileSize;

        await this.userStorageModel.updateOne(
          { userId: owner },
          {
            $set: {
              'storage.0.storageType': StorageType.IPFS,
              'storage.0.storageUsed': this.userFileSize,
            },
          },
        );
      } else {
        this.userFileSize += fileSize;
        const addStorage = new this.userStorageModel({
          userId: owner,
          storage: [
            {
              storageType: StorageType.IPFS,
              storageUsed: this.userFileSize,
            },
          ],
        });
        await addStorage.save();
      }

      const addRes = new this.IpfsPinataModel({
        ipfsHash: response.data.IpfsHash,
        pinSize: response.data.PinSize,
      });

      await addRes.save();
      fs.unlinkSync(filePath);

      return response.data;
      return;
    } catch (error) {

      throw new Error('Error uploading to Pinata IPFS');
    }
  }

  async getFileFromPinata(hashId: string): Promise<Readable> {
    try {
      const headers = {
        Authorization: `Bearer ${this.JwtApiKey}`,
      };

      // You can adjust the URL to retrieve data based on your use case.
      const url = `${this.pinataGatewayUrl}${hashId}`;

      const response = await axios.get(url, {
        headers,
        responseType: 'stream',
      });

      if (response.status !== 200) {
        throw new HttpException(
          'File not found or error occurred',
          HttpStatus.NOT_FOUND,
        );
      }

      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error retrieving file from Pinata',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  //create a group in pinata
  async createGroup(body: Object): Promise<any> {
    try {
      const response = await axios.post(`${this.pinataBaseUrl}/groups`, body, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.JwtApiKey}`,
        },
      });
      const addRes = new this.IpfsPinataGroupModel({
        groupCid: response.data.id,
        name: response.data.name,
        userId: response.data.user_id,
      });

      await addRes.save();

      return response.data;
    } catch (error) {
      console.error(
        'Error uploading group to IPFS:',
        error.response?.data || error.message,
      );
      throw new HttpException(
        'Failed to upload group to IPFS',
        error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async pinAudioFileToGroup(
    filePath: string,
    groupMetadata: any,
  ): Promise<any> {
    const form = new FormData();
    form.append('file', fs.createReadStream(filePath)); // Add audio file to form-data
    form.append('pinataOptions', JSON.stringify(groupMetadata)); // Add group metadata

    const headers = {
      ...form.getHeaders(),
      pinata_api_key: this.pinataApiKey,
      pinata_secret_api_key: this.pinataSecretApiKey,
    };

    try {
      // Send the file to Pinata
      const response = await axios.post(
        `${this.pinataBaseUrl}/pinning/pinFileToIPFS`,
        form,
        { headers },
      );

      await this.IpfsPinataGroupModel.updateOne(
        { groupCid: groupMetadata.groupId },
        { $push: { cid: '676ab24b44e9d12ce4cca1d8' } },
        { new: true },
      );

      fs.unlinkSync(filePath);
      if (response.data && response.data.IpfsHash) {
        return { success: true, cid: response.data.IpfsHash };
      } else {
        throw new HttpException(
          'Failed to pin audio file to IPFS',
          HttpStatus.BAD_REQUEST,
        );
      }
    } catch (error) {
      throw new HttpException(
        `Error pinning audio file to IPFS: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPinnedFiles(): Promise<any> {
    try {
      const headers = {
        Authorization: `Bearer ${this.JwtApiKey}`,
      };

      const response = await axios.get(`${this.pinataBaseUrl}/data/pinList`, {
        headers,
      });

      return response.data;
    } catch (error) {
      console.error(
        'Error fetching pinned files:',
        error.response || error.message,
      );
      throw new Error('Failed to fetch pinned files');
    }
  }

  async unpinFromPinata(pinataCid: string): Promise<any> {
    try {
      // Make a request to unpin the content
      const response = await axios.delete(
        `${this.pinataBaseUrl}/pinning/unpin/${pinataCid}`,
        {
          headers: {
            Authorization: `Bearer ${this.JwtApiKey}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(
        'Error unpinning from Pinata:',
        error.response || error.message,
      );
      throw new Error('Failed to unpin from Pinata');
    }
  }

  async getUserStorage(userId: string) {
    return this.userStorageModel.findOne({ userId: userId });
  }
}
