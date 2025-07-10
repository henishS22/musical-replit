/**
 *  @file NFTs controller file. routes to be used in the module
 *  @author Rafael Marques Siqueira
 *  @exports NftsController
 */

import {
  Controller,
  Body,
  Post,
  Param,
  UseGuards,
  Get,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
  ApiTags,
} from '@nestjs/swagger';

// Services Imports
import { NftsService } from './nfts.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

// Dtos imports
import {
  VerifyTokenOwnershipDto,
  AddEditionContractAsMarketplaceListerDto,
} from './dto';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';
import { GuildedNftService } from '../guilded-nft/guildedNft.service';

@Controller('nfts')
@UseInterceptors(LoggingInterceptor)
@ApiTags('Nfts')
export class NftsController {
  constructor(
    private readonly nftsService: NftsService,
    private readonly guildedNftService: GuildedNftService
  ) { }

  @UseGuards(JwtAuthGuard)
  @Get('getNftsByWallet/:walletAddress')
  @ApiOperation({
    summary: 'Get tokens created and purchased by a wallet',
  })
  async getNftsByWallet(@Param('walletAddress') walletAddress: string) {
    return this.nftsService.getNftsByWallet({
      walletAddress,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('getNftsByUser')
  @ApiOperation({
    summary: 'Get tokens created and purchased by a user Id',
  })

  async getNftsByUser(@Param('owner') owner: string) {
    return this.nftsService.getNftsByUser({
      owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('getUserDashStats')
  @ApiOperation({
    summary: 'Get User NFT Stats',
  })
  async getUserDashStats(@Param('owner') owner: string) {
    return this.nftsService.getUserDashStats({
      owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('addEditionContractAsMarketplaceLister')
  @ApiOperation({
    summary: 'Add Edition Contract As Marketplace Lister',
  })
  async addEditionContractAsMarketplaceLister(
    @Param('owner') owner: string,
    @Body()
    dto: AddEditionContractAsMarketplaceListerDto,
  ) {
    return this.nftsService.addEditionContractAsMarketplaceLister({
      owner,
      dto,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('getUserNftStats')
  @ApiOperation({
    summary: 'Get User NFT Stats',
  })
  async getUserNftStats(@Param('owner') owner: string) {
    return this.nftsService.getUserNftStats({
      owner,
    });
  }

  @Post('mainnetWebhook')
  @ApiOperation({
    summary: 'Mainnet Paper Webhook, handles purchase and other events',
  })
  async mainnetWebhook(@Body() engineWebhookDto: any) {
    return this.nftsService.mainnetWebhook({
      engineWebhookDto,
    });
  }

  // @Post('testnetWebhook')
  // @ApiOperation({
  //   summary: 'Testnet Paper Webhook, handles purchase and other events',
  // })
  // async testnetWebhook(@Body() engineWebhookDto: any) {
  //   if (engineWebhookDto?.type !== 'event-log') {
  //     return;
  //   }
  //   const { data } = engineWebhookDto ?? {};
  //   const { eventName } = data ?? {};
  //   console.log('eventName:::---->>>>>>>>', eventName);
  //   try {
  //     switch (eventName) {
  //       case 'PlatformFeeReceived':
  //         return await this.nftsService.handlePlatformFeeReceived(data);

  //       case 'RoyaltyDistributed':
  //         return await this.nftsService.handleRoyaltyDistributed(data);

  //       case 'NFTPurchased':
  //         return await this.nftsService.handleNFTPurchased(data);

  //       case 'NFTListed':
  //         return await this.nftsService.handleNftListed(data);

  //       case 'RegisteredNftForExchange':
  //         return await this.nftsService.handleRegisteredNftForExchange(data);

  //       case 'NftForExchangeApproved':
  //         return await this.nftsService.handleNftForExchangeApproved(data);

  //       case 'NftForExchangeSucceed':
  //         return await this.nftsService.handleNftForExchangeSucceed(data);

  //       case 'NftForExchangeCanceled':
  //         return await this.nftsService.handleNftForExchangeCanceled(data);

  //       case 'NftForExchangeRemoved':
  //         return await this.nftsService.handleNftForExchangeRemoved(data);

  //       default:
  //         return {
  //           status: 'ignored',
  //           message: `Unhandled event type: ${eventName}`,
  //         };
  //     }
  //   } catch (error) {
  //     throw error;
  //   }
  // }

  @Post('testnetWebhook')
  @ApiOperation({
    summary: 'Testnet Paper Webhook, handles purchase and other events',
  })
  async testnetWebhook(@Body() engineWebhookDto: any) {
    const events = typeof engineWebhookDto?.data === 'string'
      ? JSON.parse(engineWebhookDto.data)
      : engineWebhookDto.data;

    const results = [];
    for (const event of events) {
      const data = event?.data;
      // const topicSign = data?.topics[0];
      const eventName = data?.decoded?.name
      let result;
      console.log(eventName, '-----eventName------');
      // console.log(topicSign, '-----topicSign------');
      // switch (topicSign) 
      switch (eventName) {

        case 'PlatformFeeReceived':
          // case '0xabec8fa5eba11c7eac51663a2902a5a185098b166b62a23b16dc7a4e2c12de4b':
          result = await this.nftsService.handlePlatformFeeReceived(data);
          break;

        case "RoyaltyDistributed":
          // case '0xe83c6d941100284f7365d6c7d45f3cf165a8d0fd96c8db30e78d6c581454156e':
          result = await this.nftsService.handleRoyaltyDistributed(data);
          break;

        case 'NFTPurchased':
          // case '0x9e85b6dd7fe235fa470fd22b20315ac5818a20a10be53ad512e1f89a46c697b8':
          result = await this.nftsService.handleNFTPurchased(data);
          break;

        case 'NFTListed':
          // case '0x91f810d9b634f371a49dd1cfd724734a8cbff93e53dbae2aa90c6c97db9c6801':
          result = await this.nftsService.handleNftListed(data);
          break;

        case 'RegisteredNftForExchange':
          // case '0xf3d9cda8597cad68bbd28aef28cfd843de9b5433fdea045ecd61c3fb2c7e6066':
          result = await this.nftsService.handleRegisteredNftForExchange(data);
          break;

        case 'NftForExchangeApproved':
          // case '0x8d4d81ba027d18d8eda6f297ff19e2f7c67dd04bd0af071d88680865e0a392f8':
          result = await this.nftsService.handleNftForExchangeApproved(data);
          break;

        case 'NftForExchangeSucceed':
          // case '0x918fc4f7100be56dccbc65ff09cb5b0d8761a17de762fcf83e3c42b1f892cb7f':
          result = await this.nftsService.handleNftForExchangeSucceed(data);
          break;

        case 'NftForExchangeCanceled':
          // case '0x7bffc549dfcb6fb6a9d0434b73cc2fa21750dba0c7ee5fd6216320e68c7d4d64':
          result = await this.nftsService.handleNftForExchangeCanceled(data);
          break;

        case 'NftForExchangeRemoved':
          // case '0x7018b71af3cc7a6e5e5cebdfa539d1638e2fa07ba579ea6c9117c315052d6ac5':
          result = await this.nftsService.handleNftForExchangeRemoved(data);
          break;

        case 'GuildedNFTPurchased':
          result = await this.guildedNftService.handleGuildedNftPurchased(data);
          break;


        default:
          result = { message: 'Unhandled event type', eventName };
          break;
      }

      results.push({ eventName, result });
    }

    return results;
  }



  @UseGuards(JwtAuthGuard)
  @Get('getExchangeNfts')
  @ApiOperation({ summary: 'exchange nfts' })
  @ApiOkResponse({
    description: 'Returns the exchange nfts',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getExchangeNfts(
    @Param('owner') owner: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.nftsService.getExchangeNfts({
      owner,
      page,
      limit,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('getRequestedExchangeNfts')
  @ApiOperation({ summary: 'requested exchange nfts' })
  @ApiOkResponse({
    description: 'Returns the requested exchange nfts',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getRequestedExchangeNfts(
    @Param('owner') owner: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
  ) {
    return this.nftsService.getRequestedExchangeNfts({
      owner,
      page,
      limit,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get('getExchangeNft')
  @ApiOperation({ summary: 'exchange nft' })
  @ApiOkResponse({
    description: 'Returns the exchange nft',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getExchangeNft(@Query('exchangeNftId') exchangeNftId: string) {
    return this.nftsService.getExchangeNft(exchangeNftId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('coinMarketCap')
  @ApiOperation({ summary: 'coin market cap' })
  @ApiOkResponse({
    description: 'Returns the info',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getCoinMarketCapPrices() {
    return this.nftsService.getCoinMarketCapPrices();
  }

  // @UseGuards(JwtAuthGuard)
  @Get('getNftsById/:nftId')
  @ApiOperation({
    summary: 'retrieve a single nft by nft id',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getNftsByAddress(
    @Param('nftId') nftId: string,
    @Query('owner') owner: string,
    @Query('address') address: string,
  ) {
    return this.nftsService.getNftsById({
      nftId,
      owner,
      address,
    });
  }

  @Get('getNftsByContract/:contractAddress/:nftTitle')
  @ApiOperation({
    summary: 'retrieve a single nft by contract address and token id',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async getNftsByAddressAndTokenId(
    @Param('contractAddress') contractAddress: string,
    @Param('nftTitle') nftTitle: string,
    @Query('includeUsdPrice') includeUsdPrice: string,
  ) {
    return this.nftsService.getNftsByContract({
      contractAddress,
      nftTitle,
      includeUsdPrice,
    });
  }

  @Post('verifyTokenOwnership')
  @ApiOperation({
    summary: 'verify if a wallet owns an nft',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  async verifyTokenOwnership(
    @Body() verifyTokenOwnershipDto: VerifyTokenOwnershipDto,
  ) {
    return this.nftsService.verifyTokenOwnership({
      verifyTokenOwnershipDto,
    });
  }

  // @UseGuards(JwtAuthGuard)
  @Get('/')
  async getNfts(
    @Query('userId') userId: string,
    @Query('offset') offset: string,
    @Query('page') page: string,
    @Query('limit') limit: string,
    @Query('isListed') isListed: string,
    @Query('includeUsdPrice') includeUsdPrice: string,
  ) {
    return this.nftsService.getNfts({
      userId,
      offset,
      page,
      limit,
      isListed: !!isListed,
      includeUsdPrice: !!includeUsdPrice,
    });
  }

  @Get(':id/projectTracks/:projectId')
  @ApiOperation({
    summary: 'Get tracks for NFT studio and collectible',
  })
  async getNftTracksDetails(
    @Param('owner') owner: string,
    @Param('id') id: string,
    @Param('projectId') projectId: string,
    @Query('tracksFor') tracksFor: string,
    @Query('message') message?: string,
    @Query('signature') signature?: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const shouldVerifyTokenOwnership = !!id && !!message && !!signature;
    message = decodeURIComponent(message);
    const verifyTokenOwnershipDto = { nftId: id, message, signature };

    if (!tracksFor) tracksFor = 'collectibles';

    return this.nftsService.getNftTracksDetails({
      owner,
      nftId: id,
      projectId,
      tracksFor,
      ...(shouldVerifyTokenOwnership ? { verifyTokenOwnershipDto } : {}),
      query: { page, limit },
    });
  }

  @Get(':id/streams/private')
  @ApiOperation({
    summary: 'Get all the private (token holder) streams',
  })
  async getNftPrivateStreamDetails(
    @Param('id') nftId: string,
    @Query('streamSchedule') streamSchedule: string,
    @Query('limit') limit?: string,
    @Query('page') page?: string,
  ) {
    const query = { page, limit };
    return this.nftsService.getNftPrivateStreamDetails(
      nftId,
      query,
      streamSchedule,
    );
  }

  @Get('/price')
  async price(@Query('price') price: string) {
    return this.nftsService.price(price);
  }

  // @Post('/bulk-upload')
  // @ApiOperation({ summary: '', })
  // async bulkUpload(
  // ) {
  //   return this.nftsService.bulkUpload();
  // }
}
