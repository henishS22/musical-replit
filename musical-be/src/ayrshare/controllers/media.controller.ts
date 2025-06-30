import {
  Body,
  Controller,
  Delete,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { MediaService } from '../services/media.services';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOPtions } from '@/src/config/multer.config';
import {
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) { }

  @Post('upload')
  @ApiOperation({
    description: 'Upload media file',
  })
  @ApiOkResponse({
    description: 'Media uploaded successfully',
  })
  @UseInterceptors(FileInterceptor('file', multerOPtions)) // Use Multer for file handling
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const destination = `${file.filename}_${Date.now()}`; // Use custom filename from Multer
    return await this.mediaService.uploadFile(file.path, destination); // Upload to GCS
  }

  @Post('audio-image')
  @ApiOperation({ description: 'Upload media file', })
  @ApiOkResponse({ description: 'Media uploaded successfully', })
  async audioImage(@Body('audioPath') audioPath: string) {
    const url = `${process.env.BACKEND_URL}/instrument/artwork.png`
    const output = await this.mediaService.audioImage(audioPath, url);
    return await this.mediaService.uploadVideo(output);
  }

  @Delete('/:key')
  @ApiOperation({
    description: 'Remove media file',
  })
  @ApiOkResponse({
    description: 'Media removed successfully',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to delete file: No such object found',
  })
  async removeFile(@Param('key') key: string) {
    return await this.mediaService.removeFile(key);
  }
}
