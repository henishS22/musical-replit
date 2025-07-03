import { ExceptionsEnum } from './utils/enums';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Double, ObjectId } from 'mongodb';
import {
  BaseSepoliaTestnet,
  Sepolia,
  Ethereum,
  Polygon,
  PolygonAmoyTestnet,
} from '@thirdweb-dev/chains';
import { ThirdwebSDK } from '@thirdweb-dev/sdk';
import {
  Nft,
  User,
  Checkout,
  Project,
  TrackProject,
  TokenTransaction,
  LiveStream,
  NftExchange,
  NftExchangeStatus,
  UserActivity,
} from '@/src/schemas/schemas';
import {
  VerifyTokenOwnershipDto,
  GetNftsDto,
  EngineWebhookDto,
  AddEditionContractAsMarketplaceListerDto,
} from './dto';
import axios from 'axios';
import ServiceException from './exceptions/ServiceException';
import skewerToSpace from './utils/skewerToSpace';
import { FileStorageService } from '../file-storage/fileStorage.service';
import { ProjectTracksService } from '../projects/services/projectTracks.service';
import { TokenTransactionType } from '../schemas/schemas/token-transaction.schema';
import { NotifiesService } from '../notifies/notifies.service';
import { AccessControl } from '../stream/dto/create-stream.dto';
import { UserActivityService } from '../user-activity/user-activity.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';
import { Leaderboard } from '../schemas/schemas/leaderboard';
import { resourceNotFoundError } from './utils/error';
import { ethers } from 'ethers';
// import * as fs from 'fs';
// import * as path from 'path';
// import pLimit from 'p-limit';
@Injectable()
export class NftsService {
  constructor(
    private readonly configService: ConfigService,
    @InjectModel(Checkout.name) private checkoutModel: Model<Checkout>,
    @InjectModel(TokenTransaction.name)
    private tokenTransactionModel: Model<TokenTransaction>,
    @InjectModel(Nft.name) private nftModel: Model<Nft>,
    @InjectModel(NftExchange.name) private nftExchangeModel: Model<NftExchange>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(LiveStream.name) private livestreamModel: Model<LiveStream>,
    @InjectModel(UserActivity.name) private userActivityModel: Model<UserActivity>,
    @InjectModel(Leaderboard.name) private leaderboardModel: Model<Leaderboard>,
    @InjectModel('tracks_projects') private trackProjectModel: Model<TrackProject>,
    private readonly fileStorageService: FileStorageService,
    private readonly projectTracksService: ProjectTracksService,
    private readonly notificationsService: NotifiesService,
    private readonly userActivityService: UserActivityService,
  ) { }

  private getMarketplaceContractAddress(chainId: string): string {
    let marketplaceContractId = '';
    if (parseInt(chainId) === Sepolia.chainId) {
      marketplaceContractId = process.env.SEPOLIA_MARKETPLACE_CONTRACT_ADDRESS;
    } else if (parseInt(chainId) === BaseSepoliaTestnet.chainId) {
      marketplaceContractId = process.env.MARKETPLACE_CONTRACT_ADDRESS;
    } else if (parseInt(chainId) === Ethereum.chainId) {
      marketplaceContractId = process.env.ETHEREUM_MARKETPLACE_CONTRACT_ADDRESS;
    } else if (parseInt(chainId) === 80002) {
      marketplaceContractId = process.env.AMOY_MARKETPLACE_CONTRACT_ADDRESS;
    } else if (parseInt(chainId) === Polygon.chainId) {
      marketplaceContractId = process.env.POLYGON_MARKETPLACE_CONTRACT_ADDRESS;
    }

    return marketplaceContractId;
  }

  async addEditionContractAsMarketplaceLister({
    owner,
    dto,
  }: {
    owner: string;
    dto: AddEditionContractAsMarketplaceListerDto;
  }): Promise<any> {
    try {
      // verify that nft is owned by user
      const { nftId } = dto;

      const foundNft = await this.nftModel.findOne({
        _id: new ObjectId(nftId?.toString()),
      });

      if (!foundNft) {
        throw new ServiceException(
          'NFT not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      const { user, editionContractAddress, chainId } = foundNft;

      const isOwner = user?.toString() === owner?.toString();

      if (!isOwner) {
        throw new ServiceException(
          'User does not own this NFT ',
          ExceptionsEnum.InternalServerError,
        );
      }

      // add edition contract as marketplace lister
      const marketplaceContractAddress =
        this.getMarketplaceContractAddress(chainId);

      const config = {
        method: 'post',
        url: `${process.env.THIRDWEB_ENGINE_URL}/${chainId}/${marketplaceContractAddress}/roles/grant`,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.THIRDWEB_ENGINE_ACCESS_KEY}`,
          'x-backend-wallet-address':
            process.env.THIRDWEB_ENGINE_DEV_WALLET_ADDRESS,
        },
        data: {
          role: 'asset',
          address: editionContractAddress,
        },
      };

      const { data } = await axios(config);

      const { result } = data ?? {};
      const { queueId } = result ?? {};

      if (!queueId) {
        throw new ServiceException(
          'Error adding edition contract as marketplace lister',
          ExceptionsEnum.InternalServerError,
        );
      }

      return { queueId };
    } catch (error) {
      throw new ServiceException(
        'Error' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async getUserNftStats({ owner }: { owner: string }): Promise<any> {
    try {
      const nfts = await this.nftModel.aggregate([
        { $match: { user: new ObjectId(owner), tokenId: { $exists: true } } },
        { $sort: { updatedAt: -1 } },
      ]);

      // const totalNfts = nfts.length;
      const coinPrices = await this.getCoinMarketCapPrices();
      const pricePerUsd = coinPrices[BaseSepoliaTestnet.chainId];
      const nftsForSale = nfts.length;
      const { nftsSold, nftsUsdValue } = nfts.reduce(
        (acc, nft) => {
          acc.nftsSold += nft.quantityPurchased;
          let nftPriceInUsd = Number(pricePerUsd) * Number(nft.price);
          acc.nftsUsdValue += nft.quantityPurchased * nftPriceInUsd;
          return acc;
        },
        {
          nftsSold: 0,
          nftsUsdValue: 0,
        },
      );

      const user = await this.userModel.findOne({ _id: new ObjectId(owner) });
      const walletAddresses = user.wallets.map((wallet) => wallet.addr);
      const tokenTransactions = await this.tokenTransactionModel.find({
        walletAddress: { $in: walletAddresses },
        type: 'royalty',
      });
      // const { notesEarned } = tokenTransactions.reduce(
      //   (acc, txn) => {
      //     let amountInUsd = pricePerUsd * Number(txn.amount);
      //     acc.notesEarned += amountInUsd;
      //     return acc;
      //   },
      //   { notesEarned: 0 },
      // );

      const result = await this.leaderboardModel.findOne({ userId: new ObjectId(owner) });
      // const result = await this.userActivityModel.aggregate([
      //   { $match: { userId: new ObjectId(owner) } },
      //   {
      //     $group: {
      //       _id: null,
      //       totalPoints: { $sum: "$points" }
      //     }
      //   }
      // ]);

      const notesEarned = result ? result.points : 0;
      const usdVal = notesEarned * 0.10; // Assuming 1 note = 0.10 USD

      const nfStats = {
        nftsForSale,
        nftsSold,
        nftsUsdValue: usdVal,
        notesEarned: notesEarned,
      };

      return nfStats;

      /* 
            const {
              mostPopularTokens,
              recentlyUpdatedTokens,
              totalMinted,
              totalPurchases,
              totalRevenue,
            } = nfts.reduce(
              (acc, nft) => {
                const {
                  timesPurchased = 0,
                  quantityPurchased = 0,
                  totalPriceUsd = 0,
                  tokenId,
                } = nft || {};
                const nftPurchases = timesPurchased * quantityPurchased;
      
                acc.totalRevenue += totalPriceUsd;
                acc.totalPurchases += nftPurchases;
                acc.totalMinted +=
                  typeof tokenId === 'number' && tokenId > -1 ? 1 : 0;
      
                if (nftPurchases > 0) {
                  acc.mostPopularTokens.push(nft);
                  acc.mostPopularTokens.sort(
                    (a, b) => b.nftPurchases - a.nftPurchases,
                  );
                  if (acc.mostPopularTokens.length > 5) {
                    acc.mostPopularTokens.pop();
                  }
                }
      
                acc.recentlyUpdatedTokens.push(nft);
                acc.recentlyUpdatedTokens.sort(
                  (a, b) =>
                    new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
                );
                if (acc.recentlyUpdatedTokens.length > 5) {
                  acc.recentlyUpdatedTokens.pop();
                }
      
                return acc;
              },
              {
                mostPopularTokens: [],
                recentlyUpdatedTokens: [],
                totalNfts: 0,
                totalMinted: 0,
                totalPurchases: 0,
                totalRevenue: 0,
              },
            );
      
            // Get NFT images from storage
            let mostPopularTokensImageUrls = [];
            let recentlyUpdatedTokensImageUrls = [];
            try {
              const getImageName = (nft) => {
                const { _id, artworkExtension } = nft || {};
                return !!_id && !!artworkExtension
                  ? `${_id?.toString()}.${artworkExtension}`
                  : '--';
              };
      
              const mostPopularTokenImageNames = mostPopularTokens.map((nft) =>
                getImageName(nft),
              );
      
              const recentlyUpdatedTokenImageNames = recentlyUpdatedTokens.map(
                (nft) => getImageName(nft),
              );
      
              mostPopularTokensImageUrls = await this.fileStorageService.getImageUrl({
                name: mostPopularTokenImageNames,
              });
      
              recentlyUpdatedTokensImageUrls =
                await this.fileStorageService.getImageUrl({
                  name: recentlyUpdatedTokenImageNames,
                });
            } catch (error) {
              throw new ServiceException(
                'Error searching for image urls.' + JSON.stringify(error),
                ExceptionsEnum.InternalServerError,
              );
            }
      
            recentlyUpdatedTokens.forEach((nft, i) => {
              const nftImageUrl = recentlyUpdatedTokensImageUrls[i];
      
              if (nftImageUrl) {
                nft.artworkUrl = nftImageUrl;
              }
            });
      
            mostPopularTokens.forEach((nft, i) => {
              const nftImageUrl = mostPopularTokensImageUrls[i];
      
              if (nftImageUrl) {
                nft.artworkUrl = nftImageUrl;
              }
            });
      
            return {
              totalNfts,
              totalMinted,
              totalPurchases,
              totalRevenue,
              mostPopularTokens,
              recentlyUpdatedTokens,
            }; 
      */
    } catch (err: any) {
      return { error: err };
    }
  }

  async getNftsByWallet({ walletAddress }): Promise<{
    tokensCreatedByWallet?: Nft[];
    tokensPurchasedByWallet?: Nft[];
    error?: string;
  }> {
    try {
      const nftProjection = {
        editionContractAddress: 1,
        tokenId: 1,
        title: 1,
        user: 1,
        artworkExtension: 1,
      };

      const tokensCreatedByWalletPromise = this.nftModel.aggregate([
        {
          $match: {
            wallet: walletAddress,
          },
        },
        {
          $project: nftProjection,
        },
      ]);

      const checkoutsByWalletPromise = this.checkoutModel.aggregate([
        { $match: { buyer: walletAddress } },
        {
          $lookup: {
            from: 'nfts',
            localField: 'nft',
            foreignField: '_id',
            pipeline: [
              {
                $project: nftProjection,
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user_array',
                  pipeline: [
                    {
                      $project: {
                        name: 1,
                        profile_img: 1,
                      },
                    },
                  ],
                },
              },
              {
                $set: {
                  user: {
                    $arrayElemAt: ['$user_array', 0],
                  },
                },
              },
              {
                $unset: ['user_array'],
              },
            ],
            as: 'nft_array',
          },
        },
        {
          $set: {
            nft: {
              $arrayElemAt: ['$nft_array', 0],
            },
          },
        },
        {
          $unset: ['nft_array'],
        },
      ]);

      const [tokensCreatedByWallet, checkoutsByWallet] = await Promise.all([
        tokensCreatedByWalletPromise,
        checkoutsByWalletPromise,
      ]);

      const uniqueTokensPurchasedByWallet = checkoutsByWallet.reduce(
        (acc, checkout) => {
          const { nft } = checkout || {};
          const { _id } = nft || {};

          const foundNft = acc.find(
            (nft) => nft._id?.toString() === _id?.toString(),
          );

          if (!foundNft) {
            acc.push(nft);
          }

          return acc;
        },
        [],
      );

      // get Nft Image urls
      const getImageName = (nft) => {
        const { _id, artworkExtension } = nft || {};

        const nftImageName =
          !!_id && !!artworkExtension
            ? `${_id?.toString()}.${artworkExtension}`
            : '--';

        return nftImageName;
      };

      // Get NFT images for tokensCreatedByWallet
      let tokensCreatedByWalletImageUrls = [];
      try {
        const tokensCreatedByWalletImageNames = tokensCreatedByWallet.map(
          (nft) => getImageName(nft),
        );

        tokensCreatedByWalletImageUrls =
          await this.fileStorageService.getImageUrl({
            name: tokensCreatedByWalletImageNames,
          });
      } catch (error) {
        throw new ServiceException(
          'Error searching for image urls.' + JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      tokensCreatedByWallet.forEach((token, i) => {
        const imageUrl = tokensCreatedByWalletImageUrls[i];

        if (imageUrl) {
          token.artworkUrl = imageUrl;
        }
      });

      // Get NFT images for uniqueTokensPurchasedByWallet
      let tokensPurchasedByWalletImageUrls = [];
      try {
        const tokensPurchasedByWalletImageNames =
          uniqueTokensPurchasedByWallet.map((nft) => getImageName(nft));

        tokensPurchasedByWalletImageUrls =
          await this.fileStorageService.getImageUrl({
            name: tokensPurchasedByWalletImageNames,
          });
      } catch (error) {
        throw new ServiceException(
          'Error searching for image urls.' + JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      uniqueTokensPurchasedByWallet.forEach((token, i) => {
        const imageUrl = tokensPurchasedByWalletImageUrls[i];

        if (imageUrl) {
          token.artworkUrl = imageUrl;
        }
      });

      return {
        tokensCreatedByWallet,
        tokensPurchasedByWallet: uniqueTokensPurchasedByWallet,
      };
    } catch (err: any) {
      return { error: err?.message };
    }
  }

  async getNftsByUser({ owner }): Promise<{
    tokensCreatedByWallet?: Nft[];
    tokensPurchasedByWallet?: Nft[];
    error?: string;
  }> {
    try {
      const nftProjection = {
        editionContractAddress: 1,
        tokenId: 1,
        title: 1,
        user: 1,
        artworkExtension: 1,
        artworkUrl: 1,
        createdAt: 1,
      };

      const user = await this.userModel.findOne({ _id: new ObjectId(owner) });

      const walletAddresses = user.wallets.map((wallet) => wallet.addr);

      const tokensCreatedByWalletPromise = this.nftModel.aggregate([
        {
          $match: {
            wallet: {
              $in: walletAddresses,
            },
          },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: {
            path: '$user',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            ...nftProjection,
            user: {
              _id: '$user._id',
              name: '$user.name',
              email: '$user.email',
              username: '$user.username',
              profile_img: '$user.profile_img',
            },
          },
        },
      ]);

      const checkoutsByWalletPromise = this.checkoutModel.aggregate([
        { $match: { buyer: { $in: walletAddresses } } },
        { $sort: { createdAt: -1, }, },
        {
          $lookup: {
            from: 'nfts',
            localField: 'nft',
            foreignField: '_id',
            pipeline: [
              {
                $project: nftProjection,
              },
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user_array',
                  pipeline: [
                    {
                      $project: {
                        name: 1,
                        profile_img: 1,
                      },
                    },
                  ],
                },
              },
              {
                $set: {
                  user: {
                    $arrayElemAt: ['$user_array', 0],
                  },
                },
              },
              {
                $unset: ['user_array'],
              },
            ],
            as: 'nft_array',
          },
        },
        {
          $set: {
            nft: {
              $arrayElemAt: ['$nft_array', 0],
            },
          },
        },
        {
          $unset: ['nft_array'],
        },
      ]);

      const [tokensCreatedByWallet, checkoutsByWallet] = await Promise.all([
        tokensCreatedByWalletPromise,
        checkoutsByWalletPromise,
      ]);
      const uniqueTokensPurchasedByWallet = [];
      for (const checkout of checkoutsByWallet) {
        const { nft, quantityBought } = checkout || {};
        const { _id } = nft || {};

        // find the quantity on nft-exchange
        const nftExchanges = await this.nftExchangeModel.find({
          nft: _id,
          status: NftExchangeStatus.PENDING,
          $or: [{ 'user1.id': owner }, { 'user2.id': owner }],
        });
        const nftExchangeQuantity = nftExchanges.reduce((sum, exchange) => {
          //   if (exchange.user1.id.toString() === owner) {
          //     return sum + exchange.user1.quantity;
          //   } else if (exchange.user2.id.toString() === owner) {
          //     return sum + exchange.user2.quantity;
          //   }
          //   return sum;
          // }, 0);
          if (exchange?.user1?.id?.toString() === owner && exchange?.user1?.nft?.toString() === _id?.toString()) {
            return sum + exchange.user1.quantity;
          } else if (exchange?.user2?.id?.toString() === owner && exchange?.user2?.nft?.toString() === _id?.toString()) {
            return sum + exchange.user2.quantity;
          }
          return sum;
        }, 0);

        // find the quantity on marketplace/listed
        const nftListed = await this.nftModel.find({
          _id,
          tokenId: { $exists: true },
          price: { $exists: true },
          listingId: { $exists: true },
          user: owner,
        });
        const nftListedQuantity = nftListed.reduce(
          (sum, nft) =>
            sum + ((nft.initialSupply || 0) - (nft.quantityPurchased || 0)),
          0,
        );

        const foundNftIndex = uniqueTokensPurchasedByWallet.findIndex(
          (item) => item._id?.toString() === _id?.toString(),
        );

        if (foundNftIndex === -1) {
          uniqueTokensPurchasedByWallet.push({
            ...nft,
            quantity: quantityBought || 0,
            nftExchangeQuantity,
            nftListedQuantity,
            transactionHash: checkout.transactionHash,
            checkoutCreatedAt: checkout.createdAt,
            updatedAt: checkout.updatedAt,
          });
        } else {
          uniqueTokensPurchasedByWallet[foundNftIndex].quantity +=
            quantityBought || 0;
        }
      }

      // get Nft Image urls
      const getImageName = (nft) => {
        const { _id, artworkExtension } = nft || {};

        const nftImageName =
          !!_id && !!artworkExtension
            ? `${_id?.toString()}.${artworkExtension}`
            : '--';

        return nftImageName;
      };

      // Get NFT images for tokensCreatedByWallet
      let tokensCreatedByWalletImageUrls = [];
      try {
        const tokensCreatedByWalletImageNames = tokensCreatedByWallet.map(
          (nft) => getImageName(nft),
        );

        tokensCreatedByWalletImageUrls =
          await this.fileStorageService.getImageUrl({
            name: tokensCreatedByWalletImageNames,
          });
      } catch (error) {
        throw new ServiceException(
          'Error searching for image urls.' + JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      tokensCreatedByWallet.forEach((token, i) => {
        const imageUrl = tokensCreatedByWalletImageUrls[i];

        if (imageUrl) {
          token.artworkUrl = imageUrl;
        }
      });

      // Get NFT images for uniqueTokensPurchasedByWallet
      let tokensPurchasedByWalletImageUrls = [];
      try {
        const tokensPurchasedByWalletImageNames =
          uniqueTokensPurchasedByWallet.map((nft) => getImageName(nft));

        tokensPurchasedByWalletImageUrls =
          await this.fileStorageService.getImageUrl({
            name: tokensPurchasedByWalletImageNames,
          });
      } catch (error) {
        throw new ServiceException(
          'Error searching for image urls.' + JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      uniqueTokensPurchasedByWallet.forEach((token, i) => {
        const imageUrl = tokensPurchasedByWalletImageUrls[i];

        if (imageUrl) {
          token.artworkUrl = imageUrl;
        }
      });

      return {
        tokensCreatedByWallet,
        tokensPurchasedByWallet: uniqueTokensPurchasedByWallet,
      };
    } catch (err: any) {
      return { error: err?.message };
    }
  }

  async getUserDashStats({ owner }: { owner: string }): Promise<{
    totalInProgressTokens?: number;
    totalPurchases?: number;
    totalMinted?: number;
    totalRevenue?: number;
    mostPopularTokens?: any[];
    recentlyUpdatedProjects?: any[];
    error?: any;
  }> {
    try {
      const nfts = await this.nftModel.aggregate([
        { $match: { user: new ObjectId(owner) } },
        { $sort: { updatedAt: -1 } },
      ]);

      const recentlyUpdatedProjects = await this.projectModel.aggregate([
        {
          $match: {
            $or: [
              { user: new ObjectId(owner?.toString()) },
              { 'collaborators.user': new ObjectId(owner?.toString()) },
            ],
          },
        },
        {
          $project: {
            _id: 1,
            artworkExension: 1,
            createdAt: 1,
            isPublic: 1,
            name: 1,
            type: 1,
            updatedAt: 1,
          },
        },
        { $sort: { updatedAt: -1 } },
        { $limit: 10 },
      ]);

      if (!nfts || !recentlyUpdatedProjects) {
        throw new ServiceException(
          'error getting nfts or projects',
          ExceptionsEnum.InternalServerError,
        );
      }

      const {
        totalPurchases,
        totalMinted,
        totalRevenue,
        mostPopularTokens,
        totalInProgressTokens,
      } = nfts.reduce(
        (acc, nft) => {
          const {
            timesPurchased = 0,
            quantityPurchased = 0,
            totalPriceUsd = 0,
            tokenId,
            editionContractAddress,
          } = nft || {};

          const nftPurchases = timesPurchased * quantityPurchased;

          const isMinted =
            typeof tokenId === 'number' && !!editionContractAddress;

          if (!isMinted) {
            acc.totalInProgressTokens += 1;
          }

          acc.totalRevenue += totalPriceUsd;
          acc.totalPurchases += nftPurchases;
          acc.totalMinted +=
            typeof tokenId === 'number' && tokenId > -1 ? 1 : 0;

          if (nftPurchases > 0) {
            acc.mostPopularTokens.push(nft);
            acc.mostPopularTokens.sort(
              (a, b) => b.nftPurchases - a.nftPurchases,
            );
            if (acc.mostPopularTokens.length > 5) {
              acc.mostPopularTokens.pop();
            }
          }

          return acc;
        },
        {
          totalInProgressTokens: 0,
          totalPurchases: 0,
          totalMinted: 0,
          totalRevenue: 0,
          mostPopularTokens: [],
        },
      );

      // Get NFT images from storage
      let mostPopularTokensImageUrls = [];
      let recentlyUpdatedProjectsImageUrls = [];
      try {
        const getImageName = (nft) => {
          const { _id, artworkExension } = nft || {};
          return !!_id && !!artworkExension
            ? `${_id?.toString()}.${artworkExension}`
            : '--';
        };

        const mostPopularTokenImageNames = mostPopularTokens.map((nft) =>
          getImageName(nft),
        );

        const recentlyUpdatedProjectImageNames = recentlyUpdatedProjects.map(
          (project) => getImageName(project),
        );

        mostPopularTokensImageUrls = await this.fileStorageService.getImageUrl({
          name: mostPopularTokenImageNames,
        });

        recentlyUpdatedProjectsImageUrls =
          await this.fileStorageService.getImageUrl({
            name: recentlyUpdatedProjectImageNames,
          });
      } catch (error) {
        throw new ServiceException(
          'Error searching for image urls.' + JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      recentlyUpdatedProjects.forEach((project, i) => {
        const projectImageUrl = recentlyUpdatedProjectsImageUrls[i];

        if (projectImageUrl) {
          project.artworkUrl = projectImageUrl;
        }
      });

      mostPopularTokens.forEach((nft, i) => {
        const nftImageUrl = mostPopularTokensImageUrls[i];

        if (nftImageUrl) {
          nft.artworkUrl = nftImageUrl;
        }
      });

      return {
        totalInProgressTokens,
        totalMinted,
        totalPurchases,
        totalRevenue,
        mostPopularTokens,
        recentlyUpdatedProjects,
      };
    } catch (err: any) {
      return { error: err?.message };
    }
  }

  async handleNFTPurchased(data: any): Promise<any> {
    try {
      console.log('into NFTPurchased');

      // const {
      //   decodedLog,
      //   chainId,
      //   contractAddress,
      //   blockNumber,
      //   transactionHash,
      //   timestamp,
      // } = data ?? {};
      // console.log('inside handleNFTPurchased');
      // const { buyer, amount, tokenId, totalPrice } = decodedLog;
      // console.log(decodedLog, '=decodedLog');


      const {
        decoded,
        address,
        chain_id,
        block_number,
        transaction_hash,
        block_timestamp,
      } = data ?? {};

      // const abi = [
      //   "event NFTPurchased(uint256 tokenId, uint256 amount, uint256 totalPrice, address buyer)"
      // ];

      // const iface = new Interface(abi);
      // const decodedData = iface.decodeEventLog("NFTPurchased", data.data, data.topics);
      // const { amount, buyer, tokenId, totalPrice } = decodedData;

      const { name, indexed_params, non_indexed_params } = decoded
      const { amount, buyer, tokenId, totalPrice } = non_indexed_params

      const coinPrices = await this.getCoinMarketCapPrices();
      const totalPriceInCoin = parseFloat(totalPrice.toString()) / 10 ** 18;
      const pricePerUsd = coinPrices[chain_id];
      const totalPriceUsd = totalPriceInCoin * pricePerUsd;

      const nft = await this.nftModel.findOne({
        // editionContractAddress: String(assetContract?.value),
        tokenId: parseInt(tokenId.toString()),
      });

      if (!nft) {
        throw new ServiceException(
          'NFT not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      const newCheckout: Checkout = {
        nft: new ObjectId(nft?._id?.toString()),
        timestamp: new Date(block_timestamp).toISOString(),
        totalPriceUsd: new Double(totalPriceUsd) ?? new Double(0),
        buyer: buyer,
        quantityBought: parseInt(amount.toString()),
        contractAddress: address,
        transactionHash: transaction_hash,
        blockNumber: block_number,
      };

      await this.checkoutModel.create(newCheckout);

      //notification added
      // const buyerId = await this.userModel.findOne({
      //   'wallets.addr': buyer,
      // });

      const buyerId = await this.userModel.findOne({
        'wallets.addr': new RegExp(`^${buyer}$`, 'i'), // 'i' for case-insensitive
      });


      if (buyerId) {
        const fromUserId = buyerId._id.toString();
        const nftId = nft?._id?.toString();
        const userId = await this.nftModel.findOne({ _id: nftId });
        const toUserId = userId?.user.toString();
        const projectId = userId?.project.toString();

        await this.notificationsService.nftBuy(
          nftId,
          fromUserId,
          toUserId,
          projectId,
        );

        //gamification token assign
        await this.userActivityService.activity(buyerId._id.toString(), EventTypeEnum.BUY_TOKEN)
      }

      console.log('nft._id:::', nft._id);
      console.log('amount:::', amount.toString());

      const newNft = await this.nftModel.findByIdAndUpdate(
        nft._id,
        {
          $inc: {
            quantityPurchased: parseInt(amount.toString()),
            timesPurchased: 1,
          },
        },
        { new: true }
      );
      console.log(newNft, '=====newNft=====');


      const newTokenTransaction = {
        nft: nft._id,
        user: buyer,
        timestamp: new Date(block_timestamp).toISOString(),
        type: TokenTransactionType.BUY,
        tokenId: parseInt(tokenId.toString()),
        amount: parseFloat(totalPrice.toString()) / 10 ** 18,
        contractAddress: address,
        transactionHash: transaction_hash,
        blockNumber: block_number,
      };

      await this.tokenTransactionModel.create(newTokenTransaction);

    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handleRoyaltyDistributed(data: any): Promise<any> {
    try {
      console.log('into RoyaltyDistributed');
      const {
        decoded,
        address,
        block_number,
        transaction_hash,
        block_timestamp,
      } = data ?? {};
      const { name, indexed_params, non_indexed_params } = decoded;
      const { tokenId, recipient, royaltyToBeDistributed, totalAmount } = non_indexed_params;


      const nft = await this.nftModel.findOne({
        tokenId: parseInt(tokenId),
      });

      if (!nft) {
        throw new ServiceException(
          'NFT not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      const newTokenTransaction = {
        nft: new ObjectId(nft?._id?.toString()),
        user: recipient,
        timestamp: new Date(block_timestamp).toISOString(),
        type: TokenTransactionType.ROYALTY,
        tokenId: parseInt(tokenId),
        amount: parseFloat(royaltyToBeDistributed) / 10 ** 18,
        contractAddress: address,
        transactionHash: transaction_hash,
        blockNumber: block_number,
      };

      await this.tokenTransactionModel.create(newTokenTransaction);
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handlePlatformFeeReceived(data: any): Promise<any> {
    try {
      console.log('into platform fee received');

      const {
        decoded,
        address,
        block_number,
        transaction_hash,
        block_timestamp,
      } = data ?? {};
      const { name, indexed_params, non_indexed_params } = decoded;
      const { amount, feeReceiver } = non_indexed_params;

      const newTokenTransaction = {
        user: feeReceiver,
        timestamp: new Date(block_timestamp).toISOString(),
        type: TokenTransactionType.FEE,
        amount: parseFloat(amount) / 10 ** 18,
        contractAddress: address,
        transactionHash: transaction_hash,
        blockNumber: block_number,
      };

      await this.tokenTransactionModel.create(newTokenTransaction);
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handleRegisteredNftForExchange(data: any): Promise<any> {
    try {
      console.log('into RegisteredNftForExchange');

      // const { decodedLog, timestamp } = data ?? {};
      // const { exchangeId, UserAddress, TokenId, TokenAmount } = decodedLog;

      const {
        decoded,
        address,
        chain_id,
        block_number,
        transaction_hash,
        block_timestamp,
      } = data ?? {};

      // const abi = [
      //   "event RegisteredNftForExchange(uint256 exchangeId, address UserAddress, uint256 TokenId, uint256 TokenAmount)"
      // ];

      // const iface = new Interface(abi);

      // const decodedData = iface.decodeEventLog("RegisteredNftForExchange", data.data, data.topics);

      // const { exchangeId, UserAddress, TokenId, TokenAmount } = decodedData;

      const { name, indexed_params, non_indexed_params } = decoded
      const { exchangeId, UserAddress, TokenId, TokenAmount } = non_indexed_params

      // Find NFT by tokenId
      const nft = await this.nftModel.findOne({
        tokenId: parseInt(TokenId.toString()),
      });
      if (!nft) {
        throw new ServiceException(
          'NFT not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      const user = await this.userModel.findOne({
        'wallets.addr': new RegExp(`^${UserAddress}$`, 'i'),
      });
      if (!user) {
        throw new ServiceException(
          'User not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      // Try to find existing exchange
      const existingExchange: any = await this.nftExchangeModel.findOne({
        exchangeId: parseInt(exchangeId.toString()),
      });
      if (existingExchange) {
        if (existingExchange.user1 && existingExchange.user1?.nft) {
          existingExchange.user2 = {
            id: user._id,
            nft: nft._id,
            walletAddress: UserAddress,
            isApproved: false,
            tokenId: TokenId.toString(),
            quantity: parseInt(TokenAmount.toString()),
          };
        } else if (existingExchange.user2 && existingExchange.user2?.nft) {
          existingExchange.user1 = {
            id: user._id,
            nft: nft._id,
            walletAddress: UserAddress,
            isApproved: false,
            tokenId: TokenId.toString(),
            quantity: parseInt(TokenAmount.toString()),
          };
        }
        return await existingExchange.save();
      } else {
        // Create new exchange with user1
        const newExchange = {
          // nft: new ObjectId(nft?._id?.toString()),
          user1: {
            id: user._id,
            nft: nft._id,
            walletAddress: UserAddress,
            isApproved: false,
            tokenId: TokenId.toString(),
            quantity: parseInt(TokenAmount.toString()),
          },
          timestamp: new Date(block_timestamp).toISOString(),
          exchangeId: parseInt(exchangeId.toString()),
        };

        return await this.nftExchangeModel.create(newExchange);
      }
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handleNftForExchangeApproved(data: any): Promise<any> {
    try {
      console.log('into NftForExchangeApproved');

      // const abi = [
      //   "event NftForExchangeApproved(uint256 exchangeId, address approver)"
      // ];

      // const iface = new Interface(abi);
      // const decoded = iface.decodeEventLog("NftForExchangeApproved", data.data, data.topics);
      // const { exchangeId, approver } = decoded;

      const { decoded } = data ?? {};
      const { name, indexed_params, non_indexed_params } = decoded
      const { exchangeId, approver } = non_indexed_params

      // First find the exchange to check which user is approving
      const exchange = await this.nftExchangeModel.findOne({
        exchangeId: parseInt(exchangeId.toString()),
      });

      if (!exchange) {
        throw new ServiceException(
          'Exchange not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      const updateQuery = {};

      // Check which user is approving
      if (exchange.user1?.walletAddress === approver) {
        updateQuery['user1.isApproved'] = true;

        const exchangeId = exchange?._id.toString()
        const fromUserId = exchange?.user1?.id?.toString()
        const toUserId = exchange?.user2?.id?.toString()

        //here send notification to user2 
        await this.notificationsService.nftExchangeApproval(
          exchangeId,
          fromUserId,
          toUserId
        );

      } else if (exchange.user2?.walletAddress === approver) {
        updateQuery['user2.isApproved'] = true;

        const exchangeId = exchange?._id.toString()
        const fromUserId = exchange?.user2?.id?.toString()
        const toUserId = exchange?.user1?.id?.toString()

        //here send notification to user1
        await this.notificationsService.nftExchangeApproval(
          exchangeId,
          fromUserId,
          toUserId
        );

      } else {
        throw new ServiceException(
          'Approver not found in exchange',
          ExceptionsEnum.InternalServerError,
        );
      }

      return await this.nftExchangeModel.findOneAndUpdate(
        { exchangeId: parseInt(exchangeId.toString()) },
        { $set: updateQuery },
        { new: true },
      );
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handleNftForExchangeSucceed(data: any): Promise<any> {
    try {
      console.log('into NftForExchangeSucceed');

      // const {
      //   decodedLog,
      //   timestamp,
      //   contractAddress,
      //   blockNumber,
      //   transactionHash,
      // } = data ?? {};
      // const { exchangeId } = decodedLog;

      const {
        decoded,
        address,
        chain_id,
        block_number,
        transaction_hash,
        block_timestamp,
      } = data ?? {};

      // const abi = [
      //   "event NftForExchangeSucceed(uint256 exchangeId)"
      // ];

      // const iface = new Interface(abi);
      // const decodedData = iface.decodeEventLog("NftForExchangeSucceed", data.data, data.topics);
      // const { exchangeId } = decodedData

      const { name, indexed_params, non_indexed_params } = decoded
      const { exchangeId } = non_indexed_params

      // First find the exchange to check which user is approving
      const exchange = await this.nftExchangeModel.findOne({
        exchangeId: parseInt(exchangeId.toString()),
      });

      if (!exchange) {
        throw new ServiceException(
          'Exchange not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      if (exchange.user1) {
        const nft = await this.nftModel.findOne({
          tokenId: parseInt(exchange.user1?.tokenId),
        });

        if (!nft) {
          throw new ServiceException(
            'NFT not found',
            ExceptionsEnum.InternalServerError,
          );
        }

        const newCheckout: Checkout = {
          nft: new ObjectId(nft?._id?.toString()),
          timestamp: new Date(block_timestamp).toISOString(),
          buyer: exchange.user2.walletAddress,
          quantityBought: exchange.user2.quantity,
          contractAddress: address,
          transactionHash: transaction_hash,
          blockNumber: block_number,
        };
        await this.checkoutModel.create(newCheckout);
      }

      if (exchange.user2) {
        const nft = await this.nftModel.findOne({
          tokenId: parseInt(exchange.user2?.tokenId),
        });

        if (!nft) {
          throw new ServiceException(
            'NFT not found',
            ExceptionsEnum.InternalServerError,
          );
        }

        const newCheckout: Checkout = {
          nft: new ObjectId(nft?._id?.toString()),
          timestamp: new Date(block_timestamp).toISOString(),
          buyer: exchange.user1.walletAddress,
          quantityBought: exchange.user1.quantity,
          contractAddress: address,
          transactionHash: transaction_hash,
          blockNumber: block_number,
        };

        await this.checkoutModel.create(newCheckout);
      }

      return await this.nftExchangeModel.findOneAndUpdate(
        { exchangeId: parseInt(exchangeId?.value) },
        {
          $set: {
            status: NftExchangeStatus.COMPLETED,
          },
        },
        { new: true },
      );
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handleNftForExchangeCanceled(data: any): Promise<any> {
    try {
      console.log('into NftForExchangeCanceled');
      // const { decodedLog } = data ?? {};
      // const { exchangeId, caller } = decodedLog;

      // const abi = [
      //   "event NftForExchangeCanceled(uint256 exchangeId, address caller)"
      // ];

      // const iface = new Interface(abi);
      // const decoded = iface.decodeEventLog("NftForExchangeCanceled", data.data, data.topics);
      // const { exchangeId, caller } = decoded;

      const { decoded } = data ?? {};

      const { name, indexed_params, non_indexed_params } = decoded
      const { exchangeId, caller } = non_indexed_params

      const nftExchange = await this.nftExchangeModel.findOne({
        exchangeId: parseInt(exchangeId.toString()),
      });
      if (nftExchange) {
        if (nftExchange.user1?.walletAddress == caller) {
          nftExchange.user1 = undefined;
          nftExchange.status = NftExchangeStatus.PENDING;
          nftExchange.user2.isApproved = false;
        } else if (nftExchange.user2?.walletAddress == caller) {
          nftExchange.user2 = undefined;
          nftExchange.status = NftExchangeStatus.PENDING;
          nftExchange.user1.isApproved = false;
        }
        await nftExchange.save();
      }
      return nftExchange;
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handleNftForExchangeRemoved(data: any): Promise<any> {
    try {
      console.log('into NftForExchangeRemoved');

      // const { decodedLog } = data ?? {};
      // const { exchangeId } = decodedLog;

      // const abi = [
      //   "event NftForExchangeRemoved(uint256 exchangeId)"
      // ];

      // const iface = new Interface(abi);
      // const decoded = iface.decodeEventLog("NftForExchangeRemoved", data?.data, data?.topics);
      // const { exchangeId } = decoded

      const { decoded } = data ?? {};

      const { name, indexed_params, non_indexed_params } = decoded
      const { exchangeId } = non_indexed_params

      return await this.nftExchangeModel.findOneAndUpdate(
        { exchangeId: parseInt(exchangeId.toString()) },
        {
          $set: {
            status: NftExchangeStatus.REMOVED,
          },
        },
        { new: true },
      );
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async getExchangeNfts(getExchangeNftsDto: any): Promise<any> {
    try {
      let { owner, page = '1', limit = '10' } = getExchangeNftsDto || {};

      page = parseInt(page);
      limit = parseInt(limit);
      const offset = (page - 1) * limit;

      // const { offset = '0', limit = '10' } = getExchangeNftsDto || {};

      // const offsetAsInt = parseInt(offset);
      // const limitAsInt = parseInt(limit);

      const aggregationPipeline: any = [
        {
          $match: {
            status: NftExchangeStatus.PENDING,
            $or: [
              {
                user1: null,
                'user2.id': { $ne: new mongoose.Types.ObjectId(owner) },
              },
              {
                user2: null,
                'user1.id': { $ne: new mongoose.Types.ObjectId(owner) },
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: 'user1.nft',
            foreignField: '_id',
            as: 'user1_nft_details',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user_details',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        profile_img: 1,
                      },
                    },
                  ],
                },
              },
              {
                $set: {
                  user: { $arrayElemAt: ['$user_details', 0] },
                },
              },
              {
                $unset: 'user_details',
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: 'user2.nft',
            foreignField: '_id',
            as: 'user2_nft_details',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user_details',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        profile_img: 1,
                      },
                    },
                  ],
                },
              },
              {
                $set: {
                  user: { $arrayElemAt: ['$user_details', 0] },
                },
              },
              {
                $unset: 'user_details',
              },
            ],
          },
        },
        // Lookup for user1.id details
        {
          $lookup: {
            from: 'users',
            localField: 'user1.id',
            foreignField: '_id',
            as: 'user1_details',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  profile_img: 1,
                },
              },
            ],
          },
        },
        // Lookup for user2.id details
        {
          $lookup: {
            from: 'users',
            localField: 'user2.id',
            foreignField: '_id',
            as: 'user2_details',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  profile_img: 1,
                },
              },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        // {
        //   $skip: offsetAsInt,
        // },
        // {
        //   $limit: limitAsInt,
        // },
      ];

      const [exchanges, totalCount] = await Promise.all([
        this.nftExchangeModel.aggregate(aggregationPipeline),
        this.nftExchangeModel.countDocuments({
          status: NftExchangeStatus.PENDING,
          $or: [
            {
              user1: null,
              'user2.id': { $ne: new mongoose.Types.ObjectId(owner) },
            },
            {
              user2: null,
              'user1.id': { $ne: new mongoose.Types.ObjectId(owner) },
            },
          ],
        }),
      ]);

      const nftImageNames1 = [];
      const nftImageNames2 = [];
      exchanges.forEach((exchange) => {
        const _id1 = exchange?.user1_nft_details[0]?._id;
        const artworkExtension1 =
          exchange?.user1_nft_details[0]?.artworkExtension;
        const _id2 = exchange?.user1_nft_details[0]?._id;
        const artworkExtension2 =
          exchange?.user2_nft_details[0]?.artworkExtension;

        const nftImageName1 =
          !!_id1 && !!artworkExtension1
            ? `${_id1?.toString()}.${artworkExtension1}`
            : '--';
        const nftImageName2 =
          !!_id2 && !!artworkExtension2
            ? `${_id2?.toString()}.${artworkExtension2}`
            : '--';

        nftImageNames1.push(nftImageName1);
        nftImageNames2.push(nftImageName2);
      });

      // Get NFT images from storage
      let nftImageUrls1 = [];
      let nftImageUrls2 = [];
      try {
        nftImageUrls1 = await this.fileStorageService.getImageUrl({
          name: nftImageNames1,
        });
        nftImageUrls2 = await this.fileStorageService.getImageUrl({
          name: nftImageNames2,
        });
      } catch (error) {
        throw new ServiceException(
          'Error searching from image urls.' + JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      // add data to result
      exchanges.forEach((exchange, i) => {
        // NFT images
        const nftImageUrl1 = nftImageUrls1[i];
        const nftImageUrl2 = nftImageUrls2[i];
        const nftImageName1 = nftImageNames1[i];
        const nftImageName2 = nftImageNames2[i];
        if (nftImageUrl1 && nftImageName1) {
          exchange.user1_nft_details[0].artworkUrl = nftImageUrls1[i];
        }
        if (nftImageUrl2 && nftImageName2) {
          exchange.user2_nft_details[0].artworkUrl = nftImageUrls2[i];
        }
      });

      return {
        nfts: exchanges,
        pagination: {
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
          // total: totalCount,
          // offset: offsetAsInt,
          // limit: limitAsInt,
        },
      };
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async getRequestedExchangeNfts(
    getRequestedExchangeNftsDto: any,
  ): Promise<any> {
    try {
      // const {
      //   owner,
      //   offset = '0',
      //   limit = '100',
      // } = getRequestedExchangeNftsDto || {};

      // const offsetAsInt = parseInt(offset);
      // const limitAsInt = parseInt(limit);


      let { owner, page = '1', limit = '10' } = getRequestedExchangeNftsDto || {};

      page = parseInt(page);
      limit = parseInt(limit);
      const offset = (page - 1) * limit;

      const aggregationPipeline: any = [
        {
          $match: {
            status: NftExchangeStatus.PENDING,
            user1: { $ne: null },
            user2: { $ne: null },
            // Match either user1.id or user2.id as the owner
            $or: [
              { 'user1.id': new mongoose.Types.ObjectId(owner) },
              { 'user2.id': new mongoose.Types.ObjectId(owner) },
            ],
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: 'user1.nft',
            foreignField: '_id',
            as: 'user1_nft_details',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user_details',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        profile_img: 1,
                      },
                    },
                  ],
                },
              },
              {
                $set: {
                  user: { $arrayElemAt: ['$user_details', 0] },
                },
              },
              {
                $unset: 'user_details',
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: 'user2.nft',
            foreignField: '_id',
            as: 'user2_nft_details',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user_details',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        profile_img: 1,
                      },
                    },
                  ],
                },
              },
              {
                $set: {
                  user: { $arrayElemAt: ['$user_details', 0] },
                },
              },
              {
                $unset: 'user_details',
              },
            ],
          },
        },
        // Lookup for user1.id details
        {
          $lookup: {
            from: 'users',
            localField: 'user1.id',
            foreignField: '_id',
            as: 'user1_details',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  profile_img: 1,
                },
              },
            ],
          },
        },
        // Lookup for user2.id details
        {
          $lookup: {
            from: 'users',
            localField: 'user2.id',
            foreignField: '_id',
            as: 'user2_details',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  profile_img: 1,
                },
              },
            ],
          },
        },
        {
          $sort: { createdAt: -1 },
        },
        {
          $skip: offset,
        },
        {
          $limit: limit,
        },
        // {
        //   $skip: offsetAsInt,
        // },
        // {
        //   $limit: limitAsInt,
        // },
      ];

      const [exchanges, totalCount] = await Promise.all([
        this.nftExchangeModel.aggregate(aggregationPipeline),
        this.nftExchangeModel.countDocuments({
          status: NftExchangeStatus.PENDING,
          user1: { $ne: null },
          user2: { $ne: null },
          $or: [
            { 'user1.id': new mongoose.Types.ObjectId(owner) },
            { 'user2.id': new mongoose.Types.ObjectId(owner) },
          ],
        }),
      ]);

      const nftImageNames1 = [];
      const nftImageNames2 = [];
      exchanges.forEach((exchange) => {
        const _id1 = exchange?.user1_nft_details[0]._id;
        const artworkExtension1 =
          exchange?.user1_nft_details[0].artworkExtension;
        const _id2 = exchange?.user1_nft_details[0]._id;
        const artworkExtension2 =
          exchange?.user2_nft_details[0]?.artworkExtension;

        const nftImageName1 =
          !!_id1 && !!artworkExtension1
            ? `${_id1?.toString()}.${artworkExtension1}`
            : '--';
        const nftImageName2 =
          !!_id2 && !!artworkExtension2
            ? `${_id2?.toString()}.${artworkExtension2}`
            : '--';

        nftImageNames1.push(nftImageName1);
        nftImageNames2.push(nftImageName2);
      });

      // Get NFT images from storage
      let nftImageUrls1 = [];
      let nftImageUrls2 = [];
      try {
        nftImageUrls1 = await this.fileStorageService.getImageUrl({
          name: nftImageNames1,
        });
        nftImageUrls2 = await this.fileStorageService.getImageUrl({
          name: nftImageNames2,
        });
      } catch (error) {
        throw new ServiceException(
          'Error searching from image urls.' + JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      // add data to result
      exchanges.forEach((exchange, i) => {
        // NFT images
        const nftImageUrl1 = nftImageUrls1[i];
        const nftImageUrl2 = nftImageUrls2[i];
        const nftImageName1 = nftImageNames1[i];
        const nftImageName2 = nftImageNames2[i];
        if (nftImageUrl1 && nftImageName1) {
          exchange.user1_nft_details[0].artworkUrl = nftImageUrls1[i];
        }
        if (nftImageUrl2 && nftImageName2) {
          exchange.user2_nft_details[0].artworkUrl = nftImageUrls2[i];
        }
      });

      return {
        nfts: exchanges,
        pagination: {
          // total: totalCount,
          // offset: offsetAsInt,
          // limit: limitAsInt,
          total: totalCount,
          page,
          limit,
          pages: Math.ceil(totalCount / limit),
        },
      };
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async getExchangeNft(exchangeNftId: string): Promise<any> {
    try {
      const aggregationPipeline: any = [
        {
          $match: {
            _id: new ObjectId(exchangeNftId),
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: 'user1.nft',
            foreignField: '_id',
            as: 'user1_nft_details',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user_details',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        profile_img: 1,
                      },
                    },
                  ],
                },
              },
              {
                $set: {
                  user: { $arrayElemAt: ['$user_details', 0] },
                },
              },
              {
                $unset: 'user_details',
              },
            ],
          },
        },
        {
          $lookup: {
            from: 'nfts',
            localField: 'user2.nft',
            foreignField: '_id',
            as: 'user2_nft_details',
            pipeline: [
              {
                $lookup: {
                  from: 'users',
                  localField: 'user',
                  foreignField: '_id',
                  as: 'user_details',
                  pipeline: [
                    {
                      $project: {
                        _id: 1,
                        name: 1,
                        profile_img: 1,
                      },
                    },
                  ],
                },
              },
              {
                $set: {
                  user: { $arrayElemAt: ['$user_details', 0] },
                },
              },
              {
                $unset: 'user_details',
              },
            ],
          },
        },
        // Lookup for user1.id details
        {
          $lookup: {
            from: 'users',
            localField: 'user1.id',
            foreignField: '_id',
            as: 'user1_details',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  profile_img: 1,
                },
              },
            ],
          },
        },
        // Lookup for user2.id details
        {
          $lookup: {
            from: 'users',
            localField: 'user2.id',
            foreignField: '_id',
            as: 'user2_details',
            pipeline: [
              {
                $project: {
                  _id: 1,
                  name: 1,
                  profile_img: 1,
                },
              },
            ],
          },
        },
      ];
      const exchanges = await this.nftExchangeModel.aggregate(
        aggregationPipeline,
      );

      const nftImageNames1 = [];
      const nftImageNames2 = [];
      exchanges.forEach((exchange) => {
        const _id1 = exchange?.user1_nft_details[0]._id;
        const artworkExtension1 =
          exchange?.user1_nft_details[0].artworkExtension;
        const _id2 = exchange?.user1_nft_details[0]._id;
        const artworkExtension2 =
          exchange?.user2_nft_details[0]?.artworkExtension;

        const nftImageName1 =
          !!_id1 && !!artworkExtension1
            ? `${_id1?.toString()}.${artworkExtension1}`
            : '--';
        const nftImageName2 =
          !!_id2 && !!artworkExtension2
            ? `${_id2?.toString()}.${artworkExtension2}`
            : '--';

        nftImageNames1.push(nftImageName1);
        nftImageNames2.push(nftImageName2);
      });

      // Get NFT images from storage
      let nftImageUrls1 = [];
      let nftImageUrls2 = [];
      try {
        nftImageUrls1 = await this.fileStorageService.getImageUrl({
          name: nftImageNames1,
        });
        nftImageUrls2 = await this.fileStorageService.getImageUrl({
          name: nftImageNames2,
        });
      } catch (error) {
        throw new ServiceException(
          'Error searching from image urls.' + JSON.stringify(error),
          ExceptionsEnum.InternalServerError,
        );
      }

      // add data to result
      exchanges.forEach((exchange, i) => {
        // NFT images
        const nftImageUrl1 = nftImageUrls1[i];
        const nftImageUrl2 = nftImageUrls2[i];
        const nftImageName1 = nftImageNames1[i];
        const nftImageName2 = nftImageNames2[i];
        if (nftImageUrl1 && nftImageName1) {
          exchange.user1_nft_details[0].artworkUrl = nftImageUrls1[i];
        }
        if (nftImageUrl2 && nftImageName2) {
          exchange.user2_nft_details[0].artworkUrl = nftImageUrls2[i];
        }
      });

      return exchanges[0];
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async handleNftListed(data: any): Promise<any> {
    try {
      console.log('into NftListed');
      const { transaction_hash, decoded } = data;
      const { name, indexed_params, non_indexed_params } = decoded
      const { amount, listingId, price, seller, tokenId } = non_indexed_params

      // const abi = [
      //   "event NFTListed(uint256 tokenId, address seller, uint256 price, uint256 amount, uint256 listingId)"
      // ];

      // const iface = new Interface(abi);
      // const decoded = iface.decodeEventLog("NFTListed", data.data, data.topics);

      const updatedDoc = await this.nftModel.findOneAndUpdate(
        { transactionHash: transaction_hash },
        {
          tokenId: Number(tokenId?.toString()),
          listingId: listingId.toString(),
        },
        { new: true }
      );
      console.log("updatedDoc", updatedDoc);

      //gamification token assign
      await this.userActivityService.activity(updatedDoc.user.toString(), EventTypeEnum.CREATE_NFT)

    } catch (err) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async testnetWebhook(engineWebhookDto: any): Promise<any> {
    try {
      console.log('inside testnetWebhook');
      if (engineWebhookDto?.type !== 'event-log') {
        return;
      }

      const { data } = engineWebhookDto ?? {};

      // Handle NFTListed event for tokenId and listingId of NFT
      if (data.eventName === 'NFTListed') {
        const { transactionHash, decodedLog } = data;
        await this.nftModel.updateOne(
          { transactionHash },
          {
            tokenId: Number(decodedLog.tokenId.value),
            listingId: decodedLog.listingId.value,
          },
        );
      }

      const {
        decodedLog,
        chainId,
        contractAddress,
        blockNumber,
        transactionHash,
        timestamp,
      } = data ?? {};

      const { buyer, tokenId, assetContract, quantityBought, totalPricePaid } =
        decodedLog;

      const coinPrices = await this.getCoinMarketCapPrices();

      const totalPriceInCoin = parseFloat(totalPricePaid?.value) / 10 ** 18;

      const pricePerUsd = coinPrices[chainId];

      const totalPriceUsd = totalPriceInCoin * pricePerUsd;

      const nft = await this.nftModel.findOne({
        editionContractAddress: String(assetContract?.value),
        tokenId: parseInt(tokenId?.value),
      });

      if (!nft) {
        throw new ServiceException(
          'NFT not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      const newCheckout: Checkout = {
        nft: new ObjectId(nft?._id?.toString()),
        timestamp: new Date(timestamp).toISOString(),
        totalPriceUsd: new Double(totalPriceUsd) ?? new Double(0),
        buyer: buyer?.value,
        quantityBought: parseInt(quantityBought?.value),
        contractAddress,
        transactionHash,
        blockNumber,
      };

      await this.checkoutModel.create(newCheckout);
      console.log('nft._id2:::', nft._id);
      console.log('amount2:::', quantityBought?.value);
      await this.nftModel.findByIdAndUpdate(nft._id, {
        $inc: {
          quantityPurchased: parseInt(quantityBought?.value),
          timesPurchased: 1,
        },
      });
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async mainnetWebhook(engineWebhookDto: any): Promise<any> {
    try {
      console.log('inside mainnetWebhook');
      if (engineWebhookDto?.type !== 'event-log') {
        return;
      }

      const { data } = engineWebhookDto ?? {};
      const {
        decodedLog,
        chainId,
        contractAddress,
        blockNumber,
        transactionHash,
        timestamp,
      } = data ?? {};

      const { buyer, tokenId, assetContract, quantityBought, totalPricePaid } =
        decodedLog;

      const coinPrices = await this.getCoinMarketCapPrices();

      const totalPriceInCoin = parseFloat(totalPricePaid?.value) / 10 ** 18;

      const pricePerUsd = coinPrices[chainId];

      const totalPriceUsd = totalPriceInCoin * pricePerUsd;

      const nft = await this.nftModel.findOne({
        editionContractAddress: String(assetContract?.value),
        tokenId: parseInt(tokenId?.value),
      });

      if (!nft) {
        throw new ServiceException(
          'NFT not found',
          ExceptionsEnum.InternalServerError,
        );
      }

      const newCheckout: Checkout = {
        nft: new ObjectId(nft?._id?.toString()),
        timestamp: new Date(timestamp).toISOString(),
        totalPriceUsd: new Double(totalPriceUsd) ?? new Double(0),
        buyer: buyer?.value,
        quantityBought: parseInt(quantityBought?.value),
        contractAddress,
        transactionHash,
        blockNumber,
      };

      await this.checkoutModel.create(newCheckout);
      console.log('nft._id3:::', nft._id);
      console.log('amount3:::', quantityBought?.value);
      await this.nftModel.findByIdAndUpdate(nft._id, {
        $inc: {
          quantityPurchased: parseInt(quantityBought?.value),
          timesPurchased: 1,
        },
      });
    } catch (err: any) {
      const { response } = err || {};
      const { data } = response || {};
      return { error: data || err };
    }
  }

  async urlToBlob({ url }) {
    const res = await axios.get(url, { responseType: 'arraybuffer' });
    const contentType = res.headers['content-type'];
    const blob = new Blob([res.data], { type: contentType });
    return blob;
  }

  async getCoinMarketCap() {
    const { data } = await axios.get(
      'https://pro-api.coinmarketcap.com/v1/cryptocurrency/quotes/latest?slug=ethereum,polygon,polygon-ecosystem-token',
      {
        headers: {
          'X-CMC_PRO_API_KEY': process.env.COIN_MARKET_CAP_API_KEY,
        },
      },
    );
    return data;
  }

  async getCoinMarketCapPrices() {
    let prices = {
      ethereum: 0,
      polygon: 0,
      amoy: 0,
      sepolia: 0,
      "base-sepolia-testnet": 0,
      1: 0,
      137: 0,
      11155111: 0,
      80002: 0,
      84532: 0,
    };
    try {
      const { data } = await this.getCoinMarketCap();
      const { 1027: ethereum, 3890: polygon } = data || {};
      const pol = data?.[28321];

      const ethereumPrice = ethereum?.quote?.USD?.price || 0;
      // const polygonPrice = polygon?.quote?.USD?.price || 0;
      const polygonPrice = pol?.quote?.USD?.price || 0;

      prices = {
        // by name
        ethereum: ethereumPrice,
        polygon: polygonPrice,
        sepolia: ethereumPrice,
        amoy: polygonPrice,
        "base-sepolia-testnet": ethereumPrice,

        // by chain id
        1: ethereumPrice,
        137: polygonPrice,
        11155111: ethereumPrice,
        80002: polygonPrice,
        84532: ethereumPrice,
      };
    } catch {
      prices = {
        ethereum: 0,
        polygon: 0,
        amoy: 0,
        sepolia: 0,
        "base-sepolia-testnet": 0,
        1: 0,
        137: 0,
        11155111: 0,
        80002: 0,
        84532: 0,
      };
    }

    return prices;
  }

  private calculateNftPrice({ nft, prices }) {
    const allowedChains = [Polygon, BaseSepoliaTestnet, Ethereum, Sepolia, PolygonAmoyTestnet];
    const nftChain = allowedChains.find(
      ({ chainId }) => chainId === parseInt(nft?.chainId),
    );

    const coinPrice = prices[nftChain?.slug];

    return parseFloat(nft?.price || '0') * coinPrice;
  }

  async getNftsByContract({
    contractAddress,
    nftTitle,
    includeUsdPrice,
  }: {
    contractAddress: string;
    nftTitle?: string;
    includeUsdPrice?: string;
  }) {
    const regexpStr = nftTitle && skewerToSpace(nftTitle);

    const nfts = await this.nftModel.aggregate([
      {
        $match: {
          $and: [
            {
              editionContractAddress: contractAddress,
              ...(nftTitle ? { title: new RegExp(regexpStr, 'i') } : {}),
            },
            {
              // NOTE! this function only returns tokens that have actually been minted
              tokenId: { $exists: true },
            },
          ],
        },
      },
      // TODO: Should we have this?? I think probably.
      { $limit: 20 },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'project_array',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                artworkExtension: 1,
                artworkUrl: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          project: {
            $arrayElemAt: ['$project_array', 0],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_array',
          pipeline: [
            {
              $project: {
                name: 1,
                profile_img: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          user: {
            $arrayElemAt: ['$user_array', 0],
          },
        },
      },
      {
        $unset: 'user_array',
      },
      {
        $lookup: {
          from: 'releases',
          localField: 'release',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      profile_img: 1,
                    },
                  },
                ],
                as: 'user',
              },
            },
            {
              $lookup: {
                from: 'tracks',
                localField: 'finalVersions',
                foreignField: '_id',
                as: 'finalVersions',
                pipeline: [
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'user_id',
                      foreignField: '_id',
                      as: 'user_array',
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            name: 1,
                            profile_img: 1,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $set: {
                      user: {
                        $arrayElemAt: ['$user_array', 0],
                      },
                    },
                  },
                  {
                    $unset: 'user_array',
                  },
                ],
              },
            },
            {
              $lookup: {
                from: 'tracks',
                localField: 'selectedTracks',
                foreignField: '_id',
                as: 'selectedTracks',
                pipeline: [
                  {
                    $lookup: {
                      from: 'users',
                      localField: 'user_id',
                      foreignField: '_id',
                      as: 'user_array',
                      pipeline: [
                        {
                          $project: {
                            _id: 1,
                            name: 1,
                            profile_img: 1,
                          },
                        },
                      ],
                    },
                  },
                  {
                    $set: {
                      user: {
                        $arrayElemAt: ['$user_array', 0],
                      },
                    },
                  },
                  {
                    $unset: 'user_array',
                  },
                ],
              },
            },
          ],
          as: 'release_array',
        },
      },
      {
        $set: {
          release: {
            $arrayElemAt: ['$release_array', 0],
          },
        },
      },
      {
        $unset: ['release_array', 'project_array'],
      },
    ]);

    if (!nfts) {
      return '';
    }

    const nftImageNames = [];
    const projectImageNames = [];
    nfts.forEach((nft) => {
      const { _id, artworkExtension, project } = nft || {};

      const { _id: projectId, artworkExension: projectArtExtension } =
        project || {};

      const nftImageName =
        !!_id && !!artworkExtension
          ? `${_id?.toString()}.${artworkExtension}`
          : '--';

      const projectImageName =
        !!_id && !!artworkExtension
          ? `${projectId?.toString()}.${projectArtExtension}`
          : '--';

      nftImageNames.push(nftImageName);
      projectImageNames.push(projectImageName);
    });

    // Get NFT images from storage
    let nftImageUrls = [];
    try {
      const promise = this.fileStorageService.getImageUrl({
        name: nftImageNames,
      });
      nftImageUrls = await promise;
    } catch (error) {
      throw new ServiceException(
        'Error searching from image urls.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

    // Get NFT images from storage
    let projectImageUrls = [];
    try {
      projectImageUrls = await this.fileStorageService.getImageUrl({
        name: projectImageNames,
      });
    } catch (error) {
      throw new ServiceException(
        'Error searching from image urls.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

    let prices = null;
    if (includeUsdPrice) {
      prices = await this.getCoinMarketCapPrices();
    }

    // add data to result
    nfts.forEach((nft, i) => {
      // NFT images
      const nftImageUrl = nftImageUrls[i];
      const nftImageName = nftImageNames[i];

      if (nftImageUrl && nftImageName) {
        nft.artworkUrl = nftImageUrls[i];
      }

      // Project Imagers
      const projectImageUrl = projectImageUrls[i];
      const projectImageName = projectImageNames[i];

      if (projectImageUrl && projectImageName && nft?.project) {
        nft.project.artworkUrl = projectImageUrls[i];
      }

      if (includeUsdPrice && !!prices) {
        nft.priceInUsd = this.calculateNftPrice({ nft, prices });
      }
    });

    return nfts;
  }

  async getNftsById({
    nftId,
    owner,
    includeUsdPrice = true,
    address,
  }: {
    nftId: string;
    owner?: string;
    includeUsdPrice?: boolean;
    address?: string;
  }) {

    const user = await this.userModel.findOne({ _id: new ObjectId(owner) });
    let buyerAddresses: string[] = [];

    if (address) {
      buyerAddresses = [address];
    } else {
      buyerAddresses = user?.wallets.map((wallet) => wallet.addr) || [];
    }

    const checkouts = await this.checkoutModel.find({
      buyer: { $in: buyerAddresses },
      nft: nftId,
    });

    const totalQuantity = checkouts.reduce(
      (sum, checkout) => sum + checkout.quantityBought,
      0,
    );

    const nfts = await this.nftModel.aggregate([
      {
        $match: {
          $and: [
            {
              _id: new ObjectId(nftId),
            },
            {
              tokenId: { $exists: true },
            },
          ],
        },
      },
      { $limit: 20 },
      {
        $lookup: {
          from: 'projects',
          localField: 'project',
          foreignField: '_id',
          as: 'project_array',
          pipeline: [
            {
              $project: {
                _id: 1,
                name: 1,
                artworkExension: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          project: {
            $arrayElemAt: ['$project_array', 0],
          },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user_array',
          pipeline: [
            {
              $project: {
                name: 1,
                profile_img: 1,
              },
            },
          ],
        },
      },
      {
        $set: {
          user: {
            $arrayElemAt: ['$user_array', 0],
          },
        },
      },
      {
        $unset: 'user_array',
      },
      {
        $lookup: {
          from: 'releases',
          localField: 'release',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      profile_img: 1,
                    },
                  },
                ],
                as: 'user',
              },
            },
          ],
          as: 'release_array',
        },
      },
      {
        $set: {
          release: {
            $arrayElemAt: ['$release_array', 0],
          },
        },
      },
      // Add finalVersions lookup at root level
      {
        $lookup: {
          from: 'tracks',
          localField: 'finalVersions',
          foreignField: '_id',
          as: 'finalVersions',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_array',
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      profile_img: 1,
                    },
                  },
                ],
              },
            },
            {
              $set: {
                user: {
                  $arrayElemAt: ['$user_array', 0],
                },
              },
            },
            {
              $unset: 'user_array',
            },
          ],
        },
      },
      // Add selectedTracks lookup at root level
      {
        $lookup: {
          from: 'tracks',
          localField: 'selectedTracks',
          foreignField: '_id',
          as: 'selectedTracks',
          pipeline: [
            {
              $lookup: {
                from: 'users',
                localField: 'user_id',
                foreignField: '_id',
                as: 'user_array',
                pipeline: [
                  {
                    $project: {
                      _id: 1,
                      name: 1,
                      profile_img: 1,
                    },
                  },
                ],
              },
            },
            {
              $set: {
                user: {
                  $arrayElemAt: ['$user_array', 0],
                },
              },
            },
            {
              $unset: 'user_array',
            },
          ],
        },
      },
      {
        $unset: ['release_array', 'project_array'],
      },
    ]);

    if (!nfts.length) {
      return '';
    }

    // Add buy quantity to nft
    nfts[0].quantity = totalQuantity;

    // //add buyer details to nft
    // const buyer = await this.userModel.findOne(
    //   { 'wallets.addr': checkouts[0].buyer },
    //   { name: 1, profile_img: 1 }
    // );
    // nfts[0].buyer = buyer;

    const nftImageNames = [];
    const projectImageNames = [];
    nfts.forEach((nft) => {
      const { _id, artworkExtension, project } = nft || {};

      const { _id: projectId, artworkExension: projectArtExtension } =
        project || {};

      const nftImageName =
        !!_id && !!artworkExtension
          ? `${_id?.toString()}.${artworkExtension}`
          : '--';

      const projectImageName =
        !!_id && !!artworkExtension
          ? `${projectId?.toString()}.${projectArtExtension}`
          : '--';

      nftImageNames.push(nftImageName);
      projectImageNames.push(projectImageName);
    });

    // Get NFT images from storage
    let nftImageUrls = [];
    try {
      const promise = this.fileStorageService.getImageUrl({
        name: nftImageNames,
      });
      nftImageUrls = await promise;
    } catch (error) {
      throw new ServiceException(
        'Error searching from image urls.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

    // Get NFT images from storage
    let projectImageUrls = [];
    try {
      projectImageUrls = await this.fileStorageService.getImageUrl({
        name: projectImageNames,
      });
    } catch (error) {
      throw new ServiceException(
        'Error searching from image urls.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

    let prices = null;
    if (includeUsdPrice) {
      prices = await this.getCoinMarketCapPrices();
    }

    // add data to result
    nfts.forEach((nft, i) => {
      // NFT images
      const nftImageUrl = nftImageUrls[i];
      const nftImageName = nftImageNames[i];

      if (nftImageUrl && nftImageName) {
        nft.artworkUrl = nftImageUrls[i];
      }

      // Project Imagers
      const projectImageUrl = projectImageUrls[i];
      const projectImageName = projectImageNames[i];

      if (projectImageUrl && projectImageName && nft?.project) {
        nft.project.artworkUrl = projectImageUrls[i];
      }

      if (includeUsdPrice && !!prices) {
        nft.priceInUsd = this.calculateNftPrice({ nft, prices });
      }
    });

    return nfts;
  }

  async verifyTokenOwnership({
    verifyTokenOwnershipDto,
  }: {
    verifyTokenOwnershipDto: VerifyTokenOwnershipDto;
  }) {
    const {
      message,
      signature,
      tokenId,
      contractAddress,
      chainId: userProvidedChainId,
    } = verifyTokenOwnershipDto || {};

    try {
      const ERC1155_ABI = [
        "function balanceOf(address account, uint256 id) view returns (uint256)",
      ];
      const GUILDED_ABI = [
        "function userGuildedTokenBalance(address) view returns (uint256)"
      ];

      const chainRpcMap = {
        84532: "https://sepolia.base.org",
        137: "https://polygon-rpc.com",
      };

      const rpcUrl = chainRpcMap[parseInt(userProvidedChainId)];
      if (!rpcUrl) {
        throw new Error("Unsupported chain ID");
      }
      const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
      const walletAddress = ethers.utils.verifyMessage(message, signature);

      // First, check regular NFT ownership
      const contract = new ethers.Contract(process.env.TOKEN_CONTRACT_ADDRESS, ERC1155_ABI, provider);
      const balance = await contract.balanceOf(walletAddress, tokenId);
      const balanceAsNumber = balance?.toNumber?.() || 0;
      let isOwner = !!balanceAsNumber;

      // If not owner, check Guilded token ownership
      if (!isOwner) {
        const guildedContract = new ethers.Contract(
          process.env.GUILDED_TOKEN_CONTRACT_ADDRESS,
          GUILDED_ABI,
          provider
        );
        const guildedBalance = await guildedContract.userGuildedTokenBalance(walletAddress);
        const guildedBalanceAsNumber = guildedBalance?.toNumber?.() || 0;
        isOwner = !!guildedBalanceAsNumber;
      }

      return { isOwner };

      // const allowedChains = [
      //   BaseSepoliaTestnet,
      //   Sepolia,
      //   Ethereum,
      //   Polygon,
      //   PolygonAmoyTestnet,
      // ];
      // const chain = allowedChains.find(
      //   ({ chainId }) => chainId === parseInt(userProvidedChainId),
      // );
      // const sdk = new ThirdwebSDK(chain, {
      //   secretKey: process.env.THIRDWEB_SECRET_KEY,
      // });

      // // verify ownership
      // const walletAddress = sdk.wallet.recoverAddress(message, signature);
      // const contract = await sdk.getContract(contractAddress);
      // let balance = await contract.call('balanceOf', [walletAddress, tokenId]);
      // const balanceAsNumber = balance?.toNumber() || 0;
      // const isOwner = !!balanceAsNumber;
      // return { isOwner };
    } catch (err) {
      throw new ServiceException(
        `There was a problem verifying token ownership: ${err}`,
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async getNfts(getNftsDto: GetNftsDto) {
    const {
      page = '1',
      limit = '10',
      userId = '',
      isListed = true,
      includeUsdPrice = true,
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

    // Build match filter
    const matchFilter: any = {
      tokenId: { $exists: true },
      price: { $exists: true },
      ...(isListed ? { listingId: { $exists: true } } : {}),
      ...(userId ? { user: new ObjectId(userId) } : {}),
    };

    const total = await this.nftModel.countDocuments(matchFilter);
    const pages = Math.ceil(total / limitAsInt);

    const nfts = await this.nftModel.aggregate([
      { $match: matchFilter },
      { $sort: { createdAt: -1 } },
      { $skip: offset },
      { $limit: limitAsInt },
      {
        $lookup: {
          from: 'releases',
          localField: 'release',
          foreignField: '_id',
          pipeline: [
            {
              $lookup: {
                from: 'tracks',
                localField: 'finalVersions',
                foreignField: '_id',
                pipeline: [
                  {
                    $project: {
                      duration: 1,
                      genre: 1,
                      name: 1,
                      previewStart: 1,
                      previewEnd: 1,
                      _id: 1,
                    },
                  },
                ],
                as: 'finalVersions',
              },
            },
            {
              $project: {
                finalVersions: 1,
                name: 1,
                project: 1,
                status: 1,
                _id: 1,
              },
            },
          ],
          as: 'release_array',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          pipeline: [{ $project: { name: 1 } }],
          as: 'user_array',
        },
      },
      {
        $set: {
          release: { $arrayElemAt: ['$release_array', 0] },
          user: { $arrayElemAt: ['$user_array', 0] },
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: 'finalVersions',
          foreignField: '_id',
          pipeline: [
            {
              $project: {
                duration: 1,
                genre: 1,
                name: 1,
                previewStart: 1,
                previewEnd: 1,
                _id: 1,
              },
            },
          ],
          as: 'finalVersions',
        },
      },
      { $unset: ['release_array', 'user_array'] },
    ]);

    const nftImageNames = nfts.map((nft) =>
      nft?._id && nft?.artworkExtension ? `${nft._id.toString()}.${nft.artworkExtension}` : '--',
    );

    let nftImageUrls = [];
    try {
      nftImageUrls = await this.fileStorageService.getImageUrl({ name: nftImageNames });
    } catch (error) {
      throw new ServiceException(
        'Error searching for image URLs.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

    let prices = null;
    if (includeUsdPrice) {
      prices = await this.getCoinMarketCapPrices();
    }

    nfts.forEach((nft, i) => {
      const nftImageUrl = nftImageUrls[i];
      if (nftImageUrl) nft.artworkUrl = nftImageUrl;
      if (includeUsdPrice && prices) {
        nft.priceInUsd = this.calculateNftPrice({ nft, prices });
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

  async getNftTracksDetails({
    owner,
    nftId,
    projectId,
    tracksFor,
    verifyTokenOwnershipDto,
    query,
  }: {
    owner: string;
    nftId: string;
    projectId: string;
    tracksFor: string;
    verifyTokenOwnershipDto?: {
      nftId: string;
      message: string;
      signature: string;
    };
    query?: {};
  }) {
    const nft = await this.nftModel.findOne({
      _id: new ObjectId(nftId),
      project: new ObjectId(projectId),
    });

    if (!nft) {
      throw new ServiceException(
        'nft not found.',
        ExceptionsEnum.InternalServerError,
      );
    }

    let isNftUnlocked = false;
    if (verifyTokenOwnershipDto) {
      const { message, signature } = verifyTokenOwnershipDto;
      try {
        const res = await this.verifyTokenOwnership({
          verifyTokenOwnershipDto: {
            signature,
            message,
            tokenId: String(nft?.tokenId),
            contractAddress: this.configService.get<string>(
              'TOKEN_CONTRACT_ADDRESS',
            ),
            chainId: nft.chainId,
          },
        });
        const { isOwner } = res;
        isNftUnlocked = isOwner;
      } catch (error) {
        throw new ServiceException(
          'error verifying token ownership.',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    let tracksProjects = [];
    let filters = {};
    if (tracksFor === 'studio') {
      tracksProjects = await this.trackProjectModel.find({
        projectId: new ObjectId(projectId) as unknown,
      });
      filters = {
        _id: {
          $in: tracksProjects.map((trackProject) => trackProject.trackId),
        },
      };
    } else {
      tracksProjects = await this.nftModel.findOne({
        _id: new ObjectId(nftId),
      });
      filters = {
        _id: {
          $in: tracksProjects['finalVersions'],
        },
      };
    }

    let allTracks = await this.projectTracksService.getAllTracks({
      filters,
      options: { withAudioUrl: isNftUnlocked },
      query: query,
    });

    const instrumentMap = new Map();

    allTracks.data.forEach(track => {
      (track.instrument || []).forEach(inst => {
        const key = inst._id?.toString();
        if (key && !instrumentMap.has(key)) {
          instrumentMap.set(key, inst);
        }
      });
    });

    const instrument = Array.from(instrumentMap.values());

    return { instrument: instrument, tracks: allTracks.data, pagination: allTracks.pagination };
  }

  // async getNftPrivateStreamDetails(
  //   nftId: string,
  //   query: object,
  //   streamSchedule: string = 'all',
  // ) {
  //   const requestQuery: any = {
  //     nftIds: { $in: [new ObjectId(nftId)] },
  //     accessControl: AccessControl.PRIVATE,
  //   };
  //   if (streamSchedule === 'upcoming') {
  //     requestQuery['scheduleDate'] = { $gt: new Date() };
  //   }
  //   return this.livestreamModel.find({
  //     nftIds: { $in: [new ObjectId(nftId)] },
  //     accessControl: AccessControl.PRIVATE,
  //   });
  // }

  async getNftPrivateStreamDetails(
    nftId: string,
    query: { limit?: string; page?: string },
    streamSchedule: string = 'all',
  ) {
    const { limit = '10', page = '1' } = query;

    const numericLimit = parseInt(limit);
    const numericPage = parseInt(page);

    const filters: any = {
      nftIds: { $in: [new ObjectId(nftId)] },
      accessControl: AccessControl.PRIVATE,
    };

    if (streamSchedule === 'upcoming') {
      filters.scheduleDate = { $gt: new Date() };
    }

    const [results, total] = await Promise.all([
      this.livestreamModel
        .find(filters)
        .skip((numericPage - 1) * numericLimit)
        .limit(numericLimit)
        .sort({ scheduleDate: 1 }),
      this.livestreamModel.countDocuments(filters),
    ]);

    return {
      pagination: {
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages: Math.ceil(total / numericLimit),
      },
      data: results,
    };
  }


  async price(price: string) {
    const { data } = await this.getCoinMarketCap();
    const { 1027: ethereum } = data || {};
    const polygonEcosystemToken = data?.[28321];

    const ethereumPrice = ethereum?.quote?.USD?.price || 0;
    const polygonPrice = polygonEcosystemToken?.quote?.USD?.price || 0;

    const ethPrice = ethereumPrice ? (parseInt(price) / ethereumPrice) : 0
    const polPrice = polygonPrice ? (parseInt(price) / polygonPrice) : 0

    return {
      eth: ethPrice,
      matic: polPrice,
    };
  }

  // async bulkUpload() {
  //   const filePath = path.join(process.cwd(), 'bulk-nfts.json');
  //   const data = fs.readFileSync(filePath, 'utf8');
  //   const features = JSON.parse(data);
  //   const list = features?.successful;

  //   if (!Array.isArray(list)) {
  //     console.error('Invalid or missing "successful" array in bulk-nfts.json');
  //     return false;
  //   }

  //   const limit = pLimit(10);
  //   const successList: any[] = [];
  //   const failedList: any[] = [];

  //   const processNFT = async (feature: any) => {
  //     try {
  //       const response = await axios.get(feature?.tokenURI);
  //       const data = response.data;

  //       const nftObj = {
  //         title: data?.title,
  //         description: data?.description,
  //         artworkUrl: data?.artwork,
  //         tokenUri: feature?.tokenURI,
  //         tokenId: feature?.tokenId,
  //         listingId: feature?.listingId,
  //         chainId: feature?.chainId,
  //         initialSupply: 1,
  //         price: feature?.priceOfNFT,
  //         transactionHash: feature?.txHash,
  //         wallet: feature?.creator.toLowerCase(),
  //       };

  //       const nftSave = await this.nftModel.create(nftObj);
  //       successList.push(nftSave);
  //     } catch (error) {
  //       console.error(`Error processing ${feature?.tokenURI}: ${error.message}`);
  //       failedList.push(feature);
  //     }
  //   };

  //   console.log(`Total NFTs to process: ${list.length}`);

  //   // First pass
  //   await Promise.all(list.map((feature) => limit(() => processNFT(feature))));

  //   // Retry pass
  //   if (failedList.length > 0) {
  //     console.log(`Retrying failed entries: ${failedList.length}`);
  //     const retryFailed: any[] = [...failedList];
  //     failedList.length = 0; // Clear original failedList before retry

  //     await Promise.all(
  //       retryFailed.map((feature) => limit(() => processNFT(feature)))
  //     );
  //   }

  //   console.log(
  //     `Done. Success: ${successList.length}, Failed after retry: ${failedList.length}`
  //   );

  //   return successList;
  // }
}
