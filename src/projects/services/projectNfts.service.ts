import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { CreateNftDto, UpdateNftDto } from '../dto';
import ServiceException from '../exceptions/ServiceException';
import {
  Nft,
  NftDocument,
  Project,
  ProjectDocument,
  ReleaseDocument,
  Release,
} from '@/src/schemas/schemas';
import { ExceptionsEnum } from '../utils/enums';
import { mimetypeToFileExtension } from '../utils/functions';
import { ProjectGetterService } from './projectGetter.service';
import { FileStorageService } from '@/src/file-storage/fileStorage.service';

// eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
var ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

@Injectable()
export class ProjectNftsService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Nft.name) private nftModel: Model<NftDocument>,
    @InjectModel(Release.name) private releaseModel: Model<ReleaseDocument>,
    private projectGetterService: ProjectGetterService,
    private fileStorageService: FileStorageService,
  ) { }

  /**
   * Create Nft control to project
   * @param projectId Project id that belongs to Nft
   */
  async createNft(payload: { id; createNftDto: CreateNftDto }): Promise<Nft> {
    const { createNftDto } = payload;
    // const artworkExtension = mimetypeToFileExtension(
    //   createNftDto.file.mimetype,
    // );

    // if (!artworkExtension) {
    //   throw new ServiceException(
    //     'Bad File Type for uploaded file.',
    //     ExceptionsEnum.BadRequest,
    //   );
    // }

    const model = new this.nftModel({
      ...createNftDto,
      wallet: createNftDto.wallet.toLocaleLowerCase(),
      // artworkExtension,
    });

    const insertedNft = await model.save();

    // if (createNftDto.file) {
    //   //Send message to create file on bucket
    //   let uploadResult: string;

    //   try {
    //     uploadResult = await this.fileStorageService.uploadImage({
    //       id: insertedNft._id.toString(),
    //       fileCacheKey: createNftDto.file.fileCacheKey,
    //       mimetype: createNftDto.file.mimetype,
    //       size: createNftDto.file.size,
    //       isPublic: false,
    //     });
    //   } catch (error) {
    //     uploadResult = error;
    //   }

    //   //If an error ocurred, try to remove the document and throw an error
    //   if (!uploadResult) {
    //     await this.projectModel.deleteOne({
    //       user_id: createNftDto.user,
    //       _id: insertedNft._id,
    //     });

    //     throw new ServiceException(
    //       'Error uploading file',
    //       ExceptionsEnum.InternalServerError,
    //     );
    //   }
    // }

    // get artwork url
    // const imageName = `${insertedNft?._id?.toString()}.${artworkExtension}`;
    // let imageUrls = [];
    // try {
    //   imageUrls = await this.fileStorageService.getImageUrl({
    //     name: imageName,
    //   });
    // } catch (error) {
    //   throw new ServiceException(
    //     'Error searching from image urls.' + JSON.stringify(error),
    //     ExceptionsEnum.InternalServerError,
    //   );
    // }

    // const [artworkUrl] = imageUrls;

    // insertedNft.artworkUrl = artworkUrl;

    return insertedNft;
  }

  /**
   * Update Nft control to project
   * @param projectId Project id that belongs to Nft
   */
  async getNftByRelease(payload: {
    releaseId: string;
    owner?: string;
  }): Promise<Nft[]> {
    const nfts = await this.nftModel.find({
      release: new ObjectId(payload?.releaseId?.toString()),
    });

    const imageNames = [];
    nfts.forEach((nft) => {
      const { _id, artworkExtension } = nft || {};
      const name =
        !!_id && !!artworkExtension
          ? `${_id?.toString()}.${artworkExtension}`
          : '--';
      imageNames.push(name);
    });

    //Get all tracks url files from the client storage
    let imageUrls = [];
    try {
      imageUrls = await this.fileStorageService.getImageUrl({
        name: imageNames,
      });
    } catch (error) {
      throw new ServiceException(
        'Error searching from image urls.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

    nfts.forEach((nft, i) => {
      const imageUrl = imageUrls[i];
      const imageName = imageNames[i];
      if (imageUrl && imageName) {
        nft.artworkUrl = imageUrls[i];
      }
    });

    return nfts;
  }

  /**
   * Update Nft control to project
   * @param projectId Project id that belongs to Nft
   */
  async updateNft(payload: {
    updateNftDto: UpdateNftDto;
    nftId: string;
    owner?: string;
  }): Promise<any> {
    const { updateNftDto, nftId } = payload;
    const { user, release, project } = updateNftDto || {};

    const updated = await this.nftModel.findByIdAndUpdate(nftId, {
      ...(updateNftDto || {}),
      ...(user ? { user: new ObjectId(user.toString()) } : {}),
      ...(release ? { release: new ObjectId(release.toString()) } : {}),
      ...(project ? { project: new ObjectId(project.toString()) } : {}),
    });

    return updated;
  }

  /**
   * Get project and check that the initiating user has the correct permissions
   * @param projectId Project id
   */
  async getProjectNfts({
    projectId,
  }: {
    projectId: string;
    owner?: string;
  }): Promise<Nft[]> {
    const [project] = await this.projectGetterService.getAllProjects({
      _id: projectId,
    });

    if (!project) {
      throw new ServiceException(
        'project not found.',
        ExceptionsEnum.InternalServerError,
      );
    }

    const releases = await this.releaseModel.find({
      project: new ObjectId(projectId),
    });

    const tokenGatedReleaseIds = releases.reduce((acc, release) => {
      const { _id, isTokenGateKey } = release || {};
      if (!!_id && !!isTokenGateKey) {
        return [...acc, release?._id];
      }
      return acc;
    }, []);

    const nfts = await this.nftModel.aggregate([
      {
        $match: {
          release: { $in: tokenGatedReleaseIds },
          editionContractAddress: { $exists: true },
          tokenId: { $exists: true },
          listingId: { $exists: true },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          pipeline: [{ $project: { _id: 1, name: 1 } }],
          as: 'user_array',
        },
      },
      {
        $set: {
          user: {
            $arrayElemAt: ['$user_array', 0],
          },
        },
      },
      { $unset: ['user_array'] },
    ]);

    if (!nfts) {
      return [];
    }

    const imageNames = [];
    nfts.forEach((nft) => {
      const { _id, artworkExtension } = nft || {};
      const name =
        !!_id && !!artworkExtension
          ? `${_id?.toString()}.${artworkExtension}`
          : '--';
      imageNames.push(name);
    });

    //Get all tracks url files from the client storage
    let imageUrls = [];
    try {
      imageUrls = await this.fileStorageService.getImageUrl({
        name: imageNames,
      });
    } catch (error) {
      throw new ServiceException(
        'Error searching from image urls.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

    nfts.forEach((nft, i) => {
      const imageUrl = imageUrls[i];
      const imageName = imageNames[i];
      if (imageUrl && imageName) {
        nft.artworkUrl = imageUrls[i];
      }
    });

    return nfts;
  }
}
