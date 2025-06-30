import { FilterQuery, Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

import { ListAllProjectsDto, VerifyTokenOwnershipDto } from '../dto';
import ServiceException from '../exceptions/ServiceException';
import {
  Lyrics,
  Nft,
  NftDocument,
  Project,
  Release,
  ReleaseDocument,
  User,
  Track,
  ProjectDocument,
} from '@/src/schemas/schemas';
import { ExceptionsEnum } from '../utils/enums';
import { resourceNotFoundError } from '../utils/errors';
import { getArtworkImageName, getCoverImageName } from '../utils/functions';
import { Collaborator, GetProjectDetailPaylod } from '../utils/types';
import { ProjectReleasesService } from './projectReleases.service';
import { ProjectTracksService } from './projectTracks.service';
import { NftsService } from '@/src/nfts/nfts.service';
import { FileStorageService } from '@/src/file-storage/fileStorage.service';

@Injectable()
export class ProjectGetterService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Nft.name) private nftModel: Model<NftDocument>,
    @InjectModel(Release.name) private releaseModel: Model<ReleaseDocument>,
    @InjectModel(Track.name) private trackModel: Model<Track>,
    private readonly projectReleasesService: ProjectReleasesService,
    private projectTracksService: ProjectTracksService,
    private nftsService: NftsService,
    private fileStorageService: FileStorageService,
  ) { }

  /**
   * Get project and bypass permission restrictions.
   * This is for server-only use. It should not be exposed as an endpoint.
   * @param projectId Project id
   */
  async getProjectUnrestricted(projectId: string): Promise<Project> {
    const [project] = await this.getAllProjects({
      _id: new ObjectId(projectId?.toString()),
    });

    if (!project) {
      resourceNotFoundError('Project');
    }

    return project;
  }

  /**
   * Get project and check that the initiating user has the correct permissions
   * @param projectId Project id
   */
  async getProjectDetail({
    projectId,
    owner,
    verifyTokenOwnershipDto,
    includeReleases,
    includeTracks,
  }: {
    projectId: string;
    owner: string;
    verifyTokenOwnershipDto?: Omit<VerifyTokenOwnershipDto, 'chainId'> & {
      chainId?: string | undefined | null;
    };
    includeReleases?: string | boolean;
    includeTracks?: string | boolean;
  }): Promise<GetProjectDetailPaylod> {
    includeReleases = !!parseInt(
      typeof includeReleases === 'boolean' ? '0' : includeReleases,
    );
    includeTracks = !!parseInt(
      typeof includeTracks === 'boolean' ? '0' : includeTracks,
    );

    const payload: GetProjectDetailPaylod = { project: null };

    const [project] = await this.getAllProjects({
      _id: new ObjectId(projectId?.toString()),
    });

    if (!project) {
      resourceNotFoundError('Project');
    }

    let isAccessGrantedWithToken = false;
    if (verifyTokenOwnershipDto) {
      const { nftId, message, signature } = verifyTokenOwnershipDto || {};

      const nft = await this.nftModel
        .findOne({ _id: new ObjectId(nftId) })
        .populate({
          path: 'release',
          model: 'Release',
          select: { isTokenGateKey: 1 },
        });

      if (!nft) {
        throw new ServiceException(
          'nft not found.',
          ExceptionsEnum.InternalServerError,
        );
      }

      const { tokenId, editionContractAddress, project, release, chainId } =
        nft;

      const { isTokenGateKey } = (release || {}) as Release;

      if (project?.toString() !== projectId) {
        throw new ServiceException(
          'The provided nft id does not correspond to the current project resource.',
          ExceptionsEnum.Forbidden,
        );
      }

      try {
        const res = await this.nftsService.verifyTokenOwnership({
          verifyTokenOwnershipDto: {
            signature,
            message,
            tokenId: String(tokenId),
            contractAddress: editionContractAddress,
            chainId,
          },
        });
        const { isOwner } = res;
        isAccessGrantedWithToken = isOwner && isTokenGateKey;
      } catch (error) {
        throw new ServiceException(
          'error verifying token ownership.',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    const {
      user,
      collaborators = [],
      coverImageUrl,
      artworkUrl,
      isPublic,
      _id,
      name,
    } = (project || {}) as Project & { _id?: string };

    const userId = typeof user === 'string' ? user : user?._id?.toString();

    const isOriginalOwner = userId === owner;

    const collaborator = collaborators.find(
      (collab: any) => collab?.user?._id?.toString() === owner,
    );

    const limitedProject: Project & { _id?: string } = {
      _id: _id?.toString(),
      artworkExension: null,
      artworkUrl,
      collaborators: null,
      coverExtension: null,
      coverImageUrl,
      deadline: null,
      isPublic,
      name,
      ownerRoles: null,
      splitModel: null,
      spotify: null,
      type: null,
      user: null,
      youtube: null,
    };

    const tokenGateKeyRelease = await this.releaseModel.findOne({
      project: new ObjectId(projectId),
      isTokenGateKey: true,
    });

    if (!!tokenGateKeyRelease) {
      // get tracks
      const allTracks = await this.projectTracksService.getProjectTracks({
        projectId,
        options: {}
      }
      );

      payload.tracks = allTracks.tracks;

      // attach collaborators
      limitedProject.collaborators = project.collaborators;
    }

    if (
      isOriginalOwner ||
      !!collaborator ||
      isPublic ||
      isAccessGrantedWithToken
    ) {
      payload.project = project;

      if (includeReleases) {
        try {
          const releases =
            await this.projectReleasesService.getReleasesByProject(projectId);
          if (releases) {
            payload.releases = releases;
          }
        } catch {
          payload.releases = [];
        }
      }

      if (includeTracks && !payload.tracks) {
        const allTracks = await this.projectTracksService.getProjectTracks({
          projectId,
          options: {}
        }
        );

        payload.tracks = allTracks.tracks;
      }
    } else {
      payload.project = limitedProject;
    }

    return payload;
  }

  /**
   * Get project and check that the initiating user has the correct permissions
   * @param projectId Project id
   */
  async getProject({
    projectId,
    owner,
    verifyTokenOwnershipDto,
  }: {
    projectId: string;
    owner: string;
    verifyTokenOwnershipDto?: VerifyTokenOwnershipDto;
  }): Promise<Project & { _id?: string, permission?: string }> {
    const [project] = await this.getAllProjects({
      _id: projectId ? new ObjectId(projectId?.toString()) : '',
    });

    if (!project) {
      resourceNotFoundError('Project');
    }

    // Replace signed artwork url with public url
    const bucket = process.env.IMAGE_BUCKET;
    // const bucket = this.configService.get('IMAGE_BUCKET');
    const destination = `${projectId}_artwork`;
    project.artworkUrl = `https://storage.googleapis.com/${bucket}/${destination}`

    let isNftHolder = false;
    if (verifyTokenOwnershipDto) {
      const { nftId, message, signature } = verifyTokenOwnershipDto || {};

      const nft = await this.nftModel.findOne({ _id: new ObjectId(nftId) });

      if (!nft) {
        throw new ServiceException(
          'nft not found.',
          ExceptionsEnum.InternalServerError,
        );
      }

      const { tokenId, editionContractAddress, chainId } = nft;

      try {
        const res = await this.nftsService.verifyTokenOwnership({
          verifyTokenOwnershipDto: {
            signature,
            message,
            chainId,
            tokenId: String(tokenId),
            contractAddress: editionContractAddress,
          },
        });
        const { isOwner } = res;
        isNftHolder = isOwner;
      } catch (error) {
        throw new ServiceException(
          'error verifying token ownership.',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    const {
      user,
      collaborators,
      coverImageUrl,
      artworkUrl,
      isPublic,
      _id,
      name,
    } = (project || {}) as Project & { _id?: string, permission?: string };

    const userId = typeof user === 'string' ? user : user?._id?.toString();

    const isOriginalOwner = userId === owner;

    const collaborator = collaborators.find(
      (collab: any) => collab?.user?._id.toString() === owner,
    );

    const permission = collaborator ? `${collaborator.permission}` : 'OWNER';

    const limitedProject: Project & { _id?: string, permission?: string } = {
      _id: _id?.toString(),
      artworkExension: null,
      artworkUrl,
      collaborators,
      coverExtension: null,
      coverImageUrl,
      deadline: null,
      isPublic,
      name,
      ownerRoles: null,
      splitModel: null,
      spotify: null,
      type: null,
      user: null,
      youtube: null,
      permission
    };

    if (isOriginalOwner || !!collaborator || isPublic || isNftHolder) {
      return { ...project, permission };
    }

    return limitedProject;
  }

  /**
   * Get projects by list ids
   *
   * @param projectIds Project id's
   */
  async getAllProjectsByIds(projectIds: string[]): Promise<Project[]> {
    const projects = await this.getAllProjects({
      _id: { $in: projectIds.map((id) => new ObjectId(id?.toString())) },
    });

    return projects;
  }

  /**
   * Get all project from user
   * @param userId User id who will get all projects
   */
  async getAllFromUser({
    userId,
    visibility = 'all',
    filter = {},
    onlyOwner,
    search,
  }: {
    userId: string;
    visibility?: 'all' | 'public' | 'private';
    filter?:
    | { startDate: string; endDate: string; limit: string; page: string }
    | {};
    onlyOwner?: boolean | string;
    search?: string;
  }): Promise<any> {
    let conditions: any = {};

    onlyOwner = onlyOwner === 'true'
    if (onlyOwner) {
      conditions = { user: new ObjectId(userId?.toString()) };
    } else {
      conditions = {
        $or: [
          { user: new ObjectId(userId) },
          { 'collaborators.user': new ObjectId(userId) },
        ],
      }
    }

    if (visibility !== 'all') {
      conditions.isPublic = visibility === 'public';
    }

    // if (filter['startDate'] && filter['endDate']) {
    //   conditions['createdAt'] = {
    //     $gte: new Date(filter['startDate']), // Start of the range
    //     $lte: new Date(filter['endDate']), // End of the range
    //   };
    // }

    // if (filter['startDate']) {
    //   conditions['createdAt'] = { $gte: new Date(filter['startDate']) };
    // }
    // if (filter['endDate']) {
    //   conditions['createdAt'] = {
    //     ...conditions['createdAt'],
    //     $lte: new Date(filter['endDate']),
    //   };
    // }

    // Handle date range filtering
    if (filter['startDate'] && filter['endDate']) {
      const start = new Date(filter['startDate']);
      const end = new Date(filter['endDate']);
      if (start.toDateString() === end.toDateString()) {
        conditions.createdAt = {
          $gte: start,
          $lt: new Date(start.getTime() + 86400000),
        };
      } else {
        conditions.createdAt = { $gte: new Date(filter['startDate']) };
        conditions.createdAt = { ...conditions.createdAt, $lte: new Date(filter['endDate']), };
      }
    }

    if (search) {
      conditions = {
        $and: [
          { name: { $regex: new RegExp('^' + search), $options: 'i' } },
          { user: new ObjectId(userId) },
        ],
      };
    }

    const limit = filter['limit'] ? Number(filter['limit']) : 0;
    const skip = (Number(filter['page']) - 1) * limit;

    let lang = 'en';
    const projects = await this.getAllProjects(conditions, limit, lang, skip);
    const total = await this.countUserActiveDocuments(userId);

    for (let item of projects) {
      if (userId == item?.user["_id"]) {
        item["isOwner"] = true
      } else {
        item["isOwner"] = false
      }
    }

    return {
      projects,
      pagination: {
        total,
        page: Number(filter['page']) || 0,
        limit,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async countUserActiveDocuments(userId: string): Promise<number> {
    return await this.projectModel.countDocuments({
      user: new ObjectId(userId),
    });
  }

  async getAllPublicProjects(query: ListAllProjectsDto): Promise<Project[]> {
    const conditions: FilterQuery<Project> = {
      $and: [{ isPublic: true }],
    };

    const projects = await this.getAllProjects(conditions);

    if (!projects.length) {
      return [];
    }

    let filterProjects = [];

    if (query.genreIds?.length) {
      filterProjects = filterProjects.concat(
        projects.filter((project) => {
          const user = project.user as unknown;
          const user2 = user as Omit<User, 'styles'> & { styles: string[] };
          return user2.styles.some((style) => query.genreIds.includes(style));
        }),
      );
    }

    if (query.instrumentIds?.length) {
      filterProjects = filterProjects.concat(
        projects.filter((project) => {
          const skillTypes = (project.user as User).skills.map(
            (skill) => (skill.type as any)._id,
          );
          return skillTypes.some((type) => query.instrumentIds.includes(type));
        }),
      );
    }

    if (filterProjects.length) {
      const uniqObj = {};
      filterProjects = filterProjects.filter(
        (project) => !uniqObj[project._id] && (uniqObj[project._id] = true),
      );
    }

    if (query.genreIds?.length || query.instrumentIds?.length) {
      return filterProjects;
    }

    return projects;
  }

  async getAllProjects(
    query: any,
    limit = 0,
    lang = 'en',
    skip = 0,
  ): Promise<Project[]> {

    let projects = await this.projectModel
      .find(query)
      .limit(limit)
      .skip(skip)
      .populate({
        path: 'user',
        populate: [
          {
            path: 'skills',
            populate: {
              path: 'type',
              model: 'skill_types',
              select: { type: 1 },
            },
            select: { level: 0, _id: 1 },
          },
          {
            path: 'styles',
            model: 'styles',
            select: { type: 1, title: 1 },
          },
        ],
        select: { name: 1, profile_img: 1, styles: 1, _id: 1 },
      })

      .populate({ path: 'ownerRoles', select: { type: 1, title: 1 } })
      .populate({
        path: 'collaborators',
        populate: {
          path: 'user',
          model: 'User',
          select: { name: 1, profile_img: 1, wallets: 1 },
        },
      })
      .populate({
        path: 'collaborators',
        populate: {
          path: 'roles',
          model: 'collabRoles',
          select: { type: 1, title: 1 },
        },
      })
      .populate({
        path: 'updates',
        populate: {
          path: 'user',
          model: 'User',
          select: { name: 1, profile_img: 1 },
        },
      })
      .populate({
        path: 'updates',
        populate: {
          path: 'release',
          model: 'Release',
          select: { name: 1 },
        },
      })
      .populate({
        path: 'updates',
        populate: {
          path: 'info',
          populate: {
            path: 'tracks',
            model: 'Track',
            select: { name: 1 },
          },
        },
      })
      .populate({
        path: 'lyrics',
        model: Lyrics.name,
        select: { title: 1, lines: 1 },
      })
      .sort({ updatedAt: -1 });

    projects = JSON.parse(JSON.stringify(projects));

    //Get all images url files from the client storage
    for await (const project of projects) {
      //If already has artworkUrl, do nothing
      if (!project.artworkUrl) {
        //Add get url to a try catch
        let projectUrl: any;

        try {
          const resultArray = await this.fileStorageService.getImageUrl({
            name: getArtworkImageName({
              id: project._id.toString(),
              extension: project.artworkExension,
            }),
          });

          if (resultArray[0]) {
            projectUrl = resultArray[0];
          }
        } catch (error) {
          projectUrl = null;
        }

        if (projectUrl) {
          project.artworkUrl = projectUrl;
        }
      }

      if (project.coverExtension) {
        //Add get url to a try catch
        let coverImageUrl: any;

        try {
          const resultArray = await this.fileStorageService.getImageUrl({
            name: getCoverImageName({
              id: project._id.toString(),
              extension: project.coverExtension,
            }),
          });

          if (resultArray[0]) {
            coverImageUrl = resultArray[0];
          }
        } catch (error) {
          coverImageUrl = null;
        }

        if (coverImageUrl) {
          project.coverImageUrl = coverImageUrl;
        }
      }

      if (project.ownerRoles) {
        project.ownerRoles.forEach((role: any) => {
          role.title = role.title[lang];
        });
      }

      if (project.collaborators) {
        project.collaborators?.forEach((collab: any) => {
          collab.roles?.forEach((role: any) => {
            role.title = role.title[lang];
          });
        });
      }
    }
    return projects;
  }
}
