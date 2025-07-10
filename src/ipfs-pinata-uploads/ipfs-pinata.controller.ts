import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Get,
  Param,
  Res,
  HttpStatus,
  HttpException,
  Body,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { FileInterceptor } from '@nestjs/platform-express';
import { IpfsService } from './ipfs-pinata.service';
import * as fs from 'fs';
import * as path from 'path';
import { Response } from 'express';
import { Stream } from 'stream';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { StorageType } from '../schemas/utils/enums';

@Controller('ipfs-pinata')
export class IpfsPinataController {
  constructor(private readonly ipfsPinataService: IpfsService) {}

  private readonly maxFileSize = 50 * 1024 * 1024;
  private storageMap = null;

  @UseGuards(JwtAuthGuard)
  @Post('file/:owner')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 50 * 1024 * 1024 },
    }),
  )
  async uploadFile(
    @Param('owner') owner: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<void> {
    const userStorage = await this.ipfsPinataService.getUserStorage(owner);

    if (userStorage) {
      this.storageMap = userStorage.storage.find(
        (item) => (item.storageType = StorageType.IPFS),
      );

      if (
        this.storageMap &&
        this.storageMap.storageUsed + file.size > this.storageMap.storageLimit
      ) {
        throw new Error('Storage limit exceeded.');
      }
    }

    if (file.size > this.maxFileSize) {
      throw new HttpException(
        'File size exceeds the 50MB limit',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const filePath = path.join(__dirname, '..', 'uploads', file.originalname);
    fs.writeFileSync(filePath, file.buffer);

    const ipfsResult = await this.ipfsPinataService.uploadAndPinFile(
      owner,
      filePath,
      file.size,
      this.storageMap,
    );

    return ipfsResult;
  }

  @UseGuards(JwtAuthGuard)
  @Get('file/:hashId')
  async getFile(@Param('hashId') hashId: string, @Res() res: Response) {
    try {
      const fileStream: Stream = await this.ipfsPinataService.getFileFromPinata(
        hashId,
      );

      // If needed, return the file content or metadata
      fileStream.pipe(res);
    } catch (error) {
      res
        .status(error.status || 500)
        .json({ message: error.response?.data || error.message });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-group')
  async createGroup(@Body() name: string) {
    return await this.ipfsPinataService.createGroup(name);
  }

  @UseGuards(JwtAuthGuard)
  @Post('pin-audio')
  @UseInterceptors(FileInterceptor('file'))
  async addFileInGroup(
    @UploadedFile() file: Express.Multer.File,
    @Body() groupMetadata: any,
  ) {
    // Pin the uploaded file to IPFS and associate it with the group metadata
    const filePath = path.join(__dirname, '..', 'uploads', file.originalname);
    fs.writeFileSync(filePath, file.buffer);
    return this.ipfsPinataService.pinAudioFileToGroup(filePath, groupMetadata);
  }

  @UseGuards(JwtAuthGuard)
  @Get('pinFileList')
  async getPinnedList(): Promise<any> {
    return this.ipfsPinataService.getPinnedFiles();
  }

  @UseGuards(JwtAuthGuard)
  @Delete('unpin/:cid')
  async unpin(@Param('cid') cid: string): Promise<any> {
    return this.ipfsPinataService.unpinFromPinata(cid);
  }
}
