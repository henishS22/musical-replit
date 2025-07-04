import { Injectable } from '@nestjs/common';
import {
  GuildedNft,
  GuildedNftDocument,
  Subscription,
  User,
  UserDocument,
} from '../schemas/schemas';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { resourceNotFoundError } from './utils/errors';
import { ObjectId } from 'mongodb';
import { GetGuildedNftsDto } from './dto/guildedNft.dto';
import ServiceException from './exceptions/ServiceException';
import { ExceptionsEnum } from '../utils/enums';
import { NftsService } from '../nfts/nfts.service';
import { CoinflowService } from '../coinflow/coinflow.service';
import {
  BaseSepoliaTestnet,
  Sepolia,
  Ethereum,
  Polygon,
  PolygonAmoyTestnet,
} from '@thirdweb-dev/chains';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import { ethers } from 'ethers';

@Injectable()
export class GuildedNftService {
  constructor(
    @InjectModel(GuildedNft.name)
    private readonly guildedNftModel: Model<GuildedNftDocument>,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly coinflowService: CoinflowService,
    private readonly nftsService: NftsService,
  ) { }

  //api list for user and guilded nft list
  async getNfts(getNftsDto: GetGuildedNftsDto) {
    const {
      page = '1',
      limit = '10',
      isListed = true,
    } = getNftsDto || {};

    const pageAsInt = parseInt(page);
    let limitAsInt = parseInt(limit);

    if (isNaN(pageAsInt) || isNaN(limitAsInt) || pageAsInt < 1) {
      throw new ServiceException(
        `'page' must be >= 1 and 'limit' must be a valid integer.`,
        ExceptionsEnum.BadRequest,
      );
    }

    limitAsInt = limitAsInt > 100 ? 100 : limitAsInt;
    const offset = (pageAsInt - 1) * limitAsInt;

    let matchFilter: any;

    matchFilter = {
      tokenId: { $exists: true },
      listingId: { $exists: true },
      bought: false,
      isRegisterForAirDrop: false,
      isFirstTimeBuy: true,
      ...(isListed ? { listingId: { $exists: true } } : {}),
    };


    const total = await this.guildedNftModel.countDocuments(matchFilter);
    const pages = Math.ceil(total / limitAsInt);

    const nfts = await this.guildedNftModel.aggregate([
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      { $skip: offset },
      { $limit: limitAsInt },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1 } }],
          as: 'user_array',
        },
      },
    ]);

    const prices = await this.nftsService.getCoinMarketCapPrices();

    const guildedNftUsdPrice = Number(process.env.GUILDED_NFT_PRICE_IN_USD || '499');
    nfts.forEach((nft: any) => {
      if (!nft.price) {
        nft.ethereumPrice = Number(guildedNftUsdPrice / prices?.ethereum);
        nft.maticPrice = Number(guildedNftUsdPrice / prices?.polygon);
      }
    });

    return {
      data: nfts,
      pagination: {
        total,
        page: pageAsInt,
        limit: limitAsInt,
        pages,
      },
    };
  }

  async getNftsById(nftId: string) {
    const nft = await this.guildedNftModel
      .findOne({
        _id: new ObjectId(nftId),
      })
      .populate({
        path: 'user',
        select: 'name profile_img _id',
        model: 'User',
      });

    if (!nft) {
      return resourceNotFoundError('NFT');
    }
    const prices = await this.nftsService.getCoinMarketCapPrices();

    const guildedNftUsdPrice = Number(process.env.GUILDED_NFT_PRICE_IN_USD || '499');
    if (nft.isFirstTimeBuy && nft.isGuildedNFT) {
      nft.ethereumPrice = Number(guildedNftUsdPrice / prices?.ethereum);
      nft.maticPrice = Number(guildedNftUsdPrice / prices?.polygon);
      nft.priceInUsd = guildedNftUsdPrice;
    }

    return nft;
  }

  private calculateNftPrice({ nft, prices }) {
    const allowedChains = [
      Polygon,
      BaseSepoliaTestnet,
      Ethereum,
      Sepolia,
      PolygonAmoyTestnet,
    ];
    const nftChain = allowedChains.find(
      ({ chainId }) => chainId === parseInt(nft?.chainId),
    );
    const coinPrice = prices[nftChain?.slug];
    return parseFloat(nft?.price || '0') * coinPrice;
  }

  //list for re listed guilded nfts
  async getReListedNfts(getNftsDto: GetGuildedNftsDto) {
    const {
      page = '1',
      limit = '10',
      userId = '',
      isListed = true,
    } = getNftsDto || {};

    const pageAsInt = parseInt(page);
    let limitAsInt = parseInt(limit);

    if (isNaN(pageAsInt) || isNaN(limitAsInt) || pageAsInt < 1) {
      throw new ServiceException(
        `'page' must be >= 1 and 'limit' must be a valid integer.`,
        ExceptionsEnum.BadRequest,
      );
    }

    limitAsInt = limitAsInt > 100 ? 100 : limitAsInt;
    const offset = (pageAsInt - 1) * limitAsInt;

    let matchFilter: any;
    matchFilter = {
      tokenId: { $exists: true },
      listingId: { $exists: true },
      bought: false,
      isRegisterForAirDrop: false,
      isFirstTimeBuy: false,
      ...(userId ? { user: { $ne: userId } } : {}),
    };

    const total = await this.guildedNftModel.countDocuments(matchFilter);
    const pages = Math.ceil(total / limitAsInt);

    const nfts = await this.guildedNftModel.aggregate([
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      { $skip: offset },
      { $limit: limitAsInt },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1 } }],
          as: 'user_array',
        },
      },
    ]);

    const prices = await this.nftsService.getCoinMarketCapPrices();

    nfts.forEach((nft, i) => {
      nft.priceInUsd = this.calculateNftPrice({ nft, prices });
    });

    return {
      data: nfts,
      pagination: {
        total,
        page: pageAsInt,
        limit: limitAsInt,
        pages,
      },
    };
  }

  async handleGuildedNftPurchased(data: any): Promise<any> {
    try {
      console.log('into handleGuildedNftPurchased');

      const { decoded, transaction_hash } = data ?? {};

      const { name, indexed_params, non_indexed_params } = decoded;
      const { listingId, tokenId, buyer } = non_indexed_params;

      const previousNft = await this.guildedNftModel.findOne({
        tokenId: Number(tokenId?.toString()),
        listingId: listingId.toString(),
      });

      if (!previousNft) {
        return resourceNotFoundError('NFT');
      }

      previousNft.bought = true;
      await previousNft.save();

      const userData = await this.userModel.findOne({
        'wallets.addr': new RegExp(`^${buyer?.toLowerCase()}$`, 'i'),
      });

      //logic for new nft
      const nftObj = {
        title: previousNft?.title,
        description: previousNft?.description,
        artworkUrl: previousNft?.artworkUrl,
        tokenUri: previousNft?.tokenUri,
        tokenId: previousNft?.tokenId,
        chainId: previousNft?.chainId,
        initialSupply: 1,
        wallet: buyer?.toLowerCase(),
        user: new ObjectId(userData._id.toString()),
        purchaseTxnHash: transaction_hash,
        transactionHash: previousNft?.transactionHash,
        seller: previousNft?.user,
      };

      console.log('nftObj:', nftObj);

      const nftSave = await this.guildedNftModel.create(nftObj);
      console.log('nftSave:', nftSave);

      //logic for subscription
      const webhookData = {
        wallet: buyer?.toLowerCase(),
        planCode: 'LIFETIMEPASS',
      };

      await this.coinflowService.handleLifeTimeSubscription(webhookData);

      return;
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handleGuildedNftListed(data: any): Promise<any> {
    try {
      console.log('into handleGuildedNftListed');

      const { decoded } = data ?? {};

      const { name, indexed_params, non_indexed_params } = decoded;
      const { amount, listingId, price, seller, tokenId } = non_indexed_params;
      //need to add amount

      const userData = await this.userModel.findOne({
        'wallets.addr': new RegExp(`^${seller?.toLowerCase()}$`, 'i'),
      });

      const updatedDoc = await this.guildedNftModel.findOneAndUpdate(
        {
          wallet: seller.toLowerCase(),
          user: new ObjectId(userData._id.toString()),
          tokenId: Number(tokenId?.toString()),
        },
        {
          listingId: listingId.toString(),
        },
        { new: true },
      );
      console.log('updatedDoc', updatedDoc);

      return;
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async userNonce(networkChainId: string, buyer: string) {
    const ERC1155_ABI = [
      'function getUserNonce(address _user) view returns (uint256)',
    ];
    const guildedTokenAddress = '0x7b5019000eBD496aC8aa13aBf7fD85881041635d';
    const chainRpcMap = {
      84532: 'https://sepolia.base.org',
      137: 'https://polygon-rpc.com',
    };

    const rpcUrl = chainRpcMap[parseInt(networkChainId)];
    if (!rpcUrl) {
      throw new Error('Unsupported chain ID');
    }
    const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
    const contract = new ethers.Contract(
      guildedTokenAddress,
      ERC1155_ABI,
      provider,
    );
    const nonce = await contract.getUserNonce(buyer);
    return Number(nonce);
  }

  async signature(owner: string, signDto: any) {
    const { buyer, tokenId, networkChainId } = signDto;
    const marketplace = '0x067578da19fD94c8F1c9A8CEBbcC8ADB6421dae4';
    const privateKey =
      '0x8f84957b1f350af020cc385dd8008dbcdbc2ce1893f5442cafe25b916fe4437a';

    const timestamp = Math.floor(Date.now() / 1000);
    const guildedNftUsdPrice = Number(process.env.GUILDED_NFT_PRICE_IN_USD || '499');
    const price: any = await this.nftsService.price(guildedNftUsdPrice.toString());
    const userNonce = await this.userNonce(networkChainId, buyer);

    let curr = 0;
    if (networkChainId === '84532') {
      curr = price?.eth;
    } else {
      curr = price?.matic;
    }

    function toFixed18(num: number | string): string {
      // Avoid scientific notation and limit to 18 decimals
      return Number(num).toLocaleString('fullwide', { useGrouping: false, maximumFractionDigits: 18 });
    }

    const maxPrice = ethers.utils.parseEther(toFixed18(curr)).toString();

    // console.log("buyer:", buyer, typeof buyer);
    // console.log("tokenId:", tokenId, typeof tokenId);
    // console.log("maxPrice:", maxPrice, typeof maxPrice);
    // console.log("timestamp:", timestamp, typeof timestamp);
    // console.log("userNonce:", userNonce, typeof userNonce);
    // console.log("marketplace:", marketplace, typeof marketplace);
    // console.log("networkChainId:", networkChainId, typeof networkChainId);

    // buyer: 0x3799ff376455A3d095a21689B3D479DEBc1c49ED string
    // tokenId: 1 number
    // maxPrice: 205635782004750740 string
    // timestamp: 1751107521 number
    // userNonce: 0 number
    // marketplace: 0x067578da19fD94c8F1c9A8CEBbcC8ADB6421dae4 string
    // networkChainId: 84532 string
    // messageHash: 0xc4153ab4951b5a653178ceb463a03c3d10e7b999eede5f71962f95b870e9e103

    const adminSigner = new ethers.Wallet(privateKey);
    const messageHash = ethers.utils.solidityKeccak256(
      [
        'address',
        'uint256',
        'uint256',
        'uint256',
        'uint256',
        'address',
        'uint256',
      ],
      [
        buyer,
        tokenId,
        maxPrice,
        timestamp,
        userNonce,
        marketplace,
        networkChainId,
      ],
    );

    const signature = await adminSigner.signMessage(
      ethers.utils.arrayify(messageHash),
    );

    const result = {
      signature,
      timestamp,
      maxPrice,
    };

    return result;
  }

  async getOwnedNft(owner: string) {
    const nfts = await this.guildedNftModel.find({
      user: new ObjectId(owner),
    })
      .populate({
        path: 'user',
        select: 'name profile_img _id',
        model: 'User',
      })
      .populate({
        path: 'seller',
        select: 'name profile_img _id',
        model: 'User',
      })
      .sort({ createdAt: -1 });

    return { data: nfts };
  }
}
