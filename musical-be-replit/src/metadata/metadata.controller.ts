import { Body, Controller, Get, Headers, Param, Post, Put, UseGuards } from '@nestjs/common';
import { MetadataService } from './metadata.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { MetadataDto } from './dto/metadata.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { verify } from 'jsonwebtoken';

@Controller('metadata')
export class MetadataController {
  constructor(private readonly metadataService: MetadataService) { }

  @UseGuards(JwtAuthGuard)
  @Post('/create')
  @ApiOperation({
    description: 'Create Metadata for release',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async create(
    @Param('owner') owner: string,
    @Body() body: MetadataDto
  ) {
    return await this.metadataService.create(body, owner);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get/:trackId')
  @ApiOperation({
    description: 'Get Metadata for release',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async get(
    @Headers('authorization') token: string,
    @Param('trackId') trackId: string,
  ) {
    let owner = '';
    if (token) {
      const verified = verify(
        token.split(' ')[1],
        process.env.SECRET_KEY,
      ) as any;
      const { sub } = verified || {};
      owner = sub;
    }

    return this.metadataService.get(trackId, owner);
  }


  @UseGuards(JwtAuthGuard)
  @Put('/update/:trackId')
  @ApiOperation({
    description: 'Get Metadata for release',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async update(
    @Headers('authorization') token: string,
    @Param('trackId') trackId: string,
    @Body() body: MetadataDto
  ) {
    let owner = '';
    if (token) {
      const verified = verify(
        token.split(' ')[1],
        process.env.SECRET_KEY,
      ) as any;
      const { sub } = verified || {};
      owner = sub;
    }

    return this.metadataService.update(trackId, owner, body);
  }

}
