import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FeatureValidationGuard } from '../guards/feature-validation.guard';
import { Features } from '../decorators/features.decorator';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';
import { GuildedNftService } from './guildedNft.service';

@Controller('guilded-nft')
@UseInterceptors(LoggingInterceptor)
export class GuildedNftController {
  constructor(private readonly guildedNftService: GuildedNftService) { }

  @Get('/')
  async getNfts(
    @Query('offset') offset: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('isListed') isListed: string,
  ) {
    return this.guildedNftService.getNfts({
      userId: '',
      offset,
      page,
      limit,
      isListed: !!isListed
    });
  }

  @Get('getGuildedNftsById/:nftId')
  @ApiOperation({
    summary: 'retrieve a single guilded nft by nft id',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async getNftsByAddress(
    @Param('nftId') nftId: string,
  ) {
    return this.guildedNftService.getNftsById(nftId)
  }

  @Get('/relisted-nfts')
  async getReListedNfts(
    @Query('userId') userId: string,
    @Query('offset') offset: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('isListed') isListed: string,
  ) {
    return this.guildedNftService.getReListedNfts({
      userId,
      offset,
      page,
      limit,
      isListed: !!isListed
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/signature')
  async signature(
    @Param('owner') owner: string,
    @Body() signDto: any
  ) {
    return this.guildedNftService.signature(owner, signDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/owned')
  async getOwnedNft(
    @Param('owner') owner: string,
  ) {
    return this.guildedNftService.getOwnedNft(owner);
  }
}


