import { ClientKafka } from '@nestjs/microservices';
import { Model } from 'mongoose';
import { Inject, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { lastValueFrom } from 'rxjs';
import { ObjectId } from 'mongodb';

import { CreateReleasesDto, UpdateReleasesDto } from '../dto';
import ServiceException from '../exceptions/ServiceException';
import {
  Contracts,
  Project,
  ProjectDocument,
  Release,
  ReleaseDocument,
  TrackProjectDocument,
  Track,
} from '@/src/schemas/schemas';
import { ProjectNotifyService } from './projectNotifications.service';
import { ProjectUpdateService } from './projectUpdate.service';
import { ExceptionsEnum, StatusReleaseEnum } from '../utils/enums';
import { resourceDuplicateError, resourceNotFoundError } from '../utils/errors';
import { GeneralDefinedExternalTopics } from '../utils/external.topics.definitions';
import { FileStorageService } from '@/src/file-storage/fileStorage.service';
import { NotifiesService } from '@/src/notifies/notifies.service';

// eslint-disable-next-line no-var, @typescript-eslint/no-var-requires
var ffmpeg = require('fluent-ffmpeg');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
ffmpeg.setFfmpegPath(ffmpegPath);

@Injectable()
export class ProjectReleasesService {
  constructor(
    @InjectModel(Project.name) private projectModel: Model<ProjectDocument>,
    @InjectModel(Release.name) private releaseModel: Model<ReleaseDocument>,
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @InjectModel('tracks_projects')
    private trackProjectModel: Model<TrackProjectDocument>,
    private projectUpdateService: ProjectUpdateService,
    private notificationsService: ProjectNotifyService,
    private fileStorageService: FileStorageService,
    @Inject(NotifiesService) private readonly notifiesService: NotifiesService,
    @Inject('PROJECTS') private readonly clientKafka: ClientKafka,
  ) {}

  /**
   * Create new release
   * @param payload Informations to create new release
   * @return Release created
   */
  async createRelease(payload: {
    owner: string;
    id: string;
    createReleasesDto: CreateReleasesDto;
  }) {
    const project = await this.projectModel.findById(payload.id);

    if (!project) {
      resourceNotFoundError('Project');
    }

    let allTracks = new Set();

    if (payload.createReleasesDto.selectedTracks) {
      allTracks = new Set(payload.createReleasesDto.selectedTracks);
    }

    if (payload.createReleasesDto.finalVersions) {
      allTracks = new Set([
        ...allTracks,
        ...payload.createReleasesDto.finalVersions,
      ]);
    }

    if (allTracks.size) {
      const projectTracks = await this.trackProjectModel
        .find()
        .where('projectId')
        .equals(payload.id)
        .where('trackId')
        .in(Array.from(allTracks))
        .exec();

      const tracksIds = projectTracks?.map((track) => track.trackId.toString());

      payload.createReleasesDto.selectedTracks =
        payload.createReleasesDto.selectedTracks?.filter((track) =>
          tracksIds.includes(track),
        );

      payload.createReleasesDto.finalVersions =
        payload.createReleasesDto.finalVersions?.filter((track) =>
          tracksIds.includes(track),
        );
    }

    const releaseFound = await this.releaseModel.findOne({
      $or: [
        {
          project: new ObjectId(payload.id),
          name: payload.createReleasesDto.name,
          status: StatusReleaseEnum.FINISHED,
        },
        {
          project: new ObjectId(payload.id),
          status: StatusReleaseEnum.IN_PROGRESS,
        },
      ],
    });

    if (releaseFound) {
      if (releaseFound.status === 'FINISHED') {
        const uniqueName = `${payload.createReleasesDto.name} (copy)`;
        payload.createReleasesDto.name = uniqueName;
      } else if (releaseFound.status === 'IN_PROGRESS') {
        throw new ServiceException(
          `Project already has an unfinished release`,
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    const releaseCreated = await this.releaseModel.create({
      ...payload.createReleasesDto,
      contracts: payload.createReleasesDto.contracts.map((contract) => ({
        ...contract,
        user: new ObjectId(contract.user),
      })),
      user: payload.owner,
      project: payload.id,
      address: '',
    });

    await this.projectUpdateService.createCreatedRelease(
      project._id,
      releaseCreated._id,
      new ObjectId(payload.owner),
    );

    return releaseCreated;
  }

  async updateWalletAddressOnReleaseSplit(payload: {
    owner: string;
    id: string;
    data: { address: string };
  }) {
    try {
      const release = await this.releaseModel.findById(payload.id);

      if (!release) {
        resourceNotFoundError('Release');
      }

      if (release?.status?.toUpperCase() === 'FINISHED') {
        throw new ServiceException(
          `Cannot update a finished release.`,
          ExceptionsEnum.BadRequest,
        );
      }

      const { contracts = [] } = release;

      const newContracts = [...contracts]?.map((contract) => {
        const isOwnerContract = contract?.user?.toString() === payload?.owner;

        if (isOwnerContract) {
          return {
            ...contract,
            address: payload?.data?.address || '',
          };
        } else {
          return contract;
        }
      });

      await this.releaseModel.findByIdAndUpdate(payload.id, {
        $set: { contracts: newContracts },
      });

      const [releaseUpdated] = await this.getAllReleases({ _id: payload.id });

      return releaseUpdated;
    } catch (err) {
      throw new ServiceException(
        `There was a problem updating the split address.`,
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  /**
   * Update new release
   * @param payload Informations to update new release
   * @return Release update
   */
  async updateRelease(payload: {
    owner: string;
    id: string;
    updateReleaseDto: UpdateReleasesDto;
  }) {
    const release = await this.releaseModel.findById(
      new ObjectId(payload.id?.toString()),
    );
    const project = await this.projectModel.findById(
      new ObjectId(release.project?.toString()),
    );

    if (!release) {
      resourceNotFoundError('Release');
    }

    const { contracts, fundDistributions: existingFundDistributions = [] } =
      release;
    const projectId = new ObjectId(release.project.toString());
    const releaseId = new ObjectId(release._id);
    const {
      contracts: newContracts,
      fundDistributions: newFundDistributions = [],
    } = payload.updateReleaseDto;
    const hasUpdatedContracts = !!newContracts;

    if (hasUpdatedContracts && !newContracts?.length) {
      throw new ServiceException(
        `provided contracts array is empty.`,
        ExceptionsEnum.BadRequest,
      );
    }

    // Check if owner has updated user splits to notify other users
    const contractsToCheck = newContracts || release?.contracts || [];

    const { sum, hasInvalidSplit, hasInvalidAddress, hasUpdatedSplit } =
      contractsToCheck.reduce(
        (acc, contract) => {
          const newSum = acc.sum + (contract?.split || 0);
          const newHasInvalidSplit =
            contract?.split <= 0 || acc.hasInvalidSplit;
          const newHasInvalidAddress = !contract?.address;

          const oldContract = contracts.find(
            (oldContract) => oldContract.user.toString() === contract.user,
          );
          const isUpdated = contract?.split !== oldContract?.split;
          const newHasUpdatedSplit = acc.hasUpdatedSplit || isUpdated;

          return {
            sum: newSum,
            hasInvalidSplit: newHasInvalidSplit,
            hasInvalidAddress: newHasInvalidAddress,
            hasUpdatedSplit: newHasUpdatedSplit,
          };
        },
        {
          sum: 0,
          hasInvalidSplit: false,
          hasInvalidAddress: false,
          hasUpdatedSplit: false,
        },
      ) || {};

    // prevent changes after release is FINISHED
    // Note: previously, this block rejected all changes except
    // to the name field. It's unclear why the name should be
    // allowed to change so I (Austin Imperial) have removed this exception for now.
    const fieldsPermittedToUpdateAfterFinished = [
      'splitContractAddress',
      'editionContractAddress',
      'fundDistributions',
      'name',
    ];

    if (release.status === 'FINISHED') {
      const fieldsToUpdate = Object.keys(payload?.updateReleaseDto || {});
      const isInvalidUpdate =
        fieldsToUpdate.some(
          (field) => !fieldsPermittedToUpdateAfterFinished.includes(field),
        ) && !!fieldsToUpdate.length;

      if (isInvalidUpdate) {
        throw new ServiceException(
          `Release is already finished. You can only update the following after
          a release is finished: [${fieldsPermittedToUpdateAfterFinished.join(
            ', ',
          )}]`,
          ExceptionsEnum.BadRequest,
        );
      }

      if (
        payload?.updateReleaseDto?.splitContractAddress &&
        !!release?.splitContractAddress
      ) {
        throw new ServiceException(
          `Release already has a splitContractAddress.`,
          ExceptionsEnum.BadRequest,
        );
      }

      if (
        payload?.updateReleaseDto?.editionContractAddress &&
        !!release?.editionContractAddress
      ) {
        throw new ServiceException(
          `Release already has a editionContractAddress.`,
          ExceptionsEnum.BadRequest,
        );
      }
    }

    // validate release if release is being finished
    const isFinishingRelease =
      release.status !== 'FINISHED' &&
      payload.updateReleaseDto?.status === 'FINISHED';
    if (isFinishingRelease) {
      const isInvalidSplitSum = sum !== 100;
      if (isInvalidSplitSum) {
        throw new ServiceException(
          `Invalid split sum. Sum should be 100 but is ${sum}.`,
          ExceptionsEnum.BadRequest,
        );
      } else if (hasInvalidSplit) {
        throw new ServiceException(
          `Contracts contain an invalid split. Splits must be greater than 0.`,
          ExceptionsEnum.BadRequest,
        );
      } else if (hasInvalidAddress) {
        throw new ServiceException(
          `One or more contracts does not have an address.`,
          ExceptionsEnum.BadRequest,
        );
      }
    }

    if (hasUpdatedSplit) {
      await this.notificationsService.registerUpdatedSplits(
        projectId,
        new ObjectId(payload.owner),
        releaseId,
      );
    }

    const currentUserContract = contracts.find(
      ({ user }) => user.toString() === payload.owner,
    );
    const currentUserNewContractStatus = newContracts?.find(
      ({ user }) => user.toString() === payload.owner,
    );
    const hasAnsweredContract =
      hasUpdatedContracts &&
      this.userHasAnsweredContractSplit(
        currentUserContract,
        currentUserNewContractStatus,
      );
    if (hasAnsweredContract && !hasUpdatedSplit) {
      await this.notificationsService.registerAnsweredContractSplit(
        projectId,
        new ObjectId(payload.owner),
        releaseId,
        currentUserNewContractStatus?.accepted,
      );
    }

    let selectedTracks = release.selectedTracks?.map((track: any) =>
      track._id.toString(),
    );
    const originalSelectedTracks = release.selectedTracks.map((track: any) =>
      track._id.toString(),
    );

    let finalVersions = release.finalVersions?.map((track: any) =>
      track._id.toString(),
    );

    const originalFinalVersions = release.finalVersions.map((track: any) =>
      track._id.toString(),
    );

    const { removeSelectedTracks, removeFinalVersions, ...updateReleaseDto } =
      payload.updateReleaseDto;

    const originalName = release.name;
    const newName = payload.updateReleaseDto.name;
    const hasChangedName = !!newName?.trim() && originalName !== newName;

    let allTracks = [];

    if (updateReleaseDto?.selectedTracks) {
      selectedTracks = Array.from(
        new Set([...selectedTracks, ...updateReleaseDto.selectedTracks]),
      );
      allTracks = updateReleaseDto.selectedTracks;

      const addedTracks = updateReleaseDto.selectedTracks.filter(
        (track) => !originalSelectedTracks.includes(track),
      );

      const addedTracksObjectIds = addedTracks.map(
        (track) => new ObjectId(track),
      );

      if (addedTracks.length) {
        await this.projectUpdateService.createAddedFilesToRelease(
          projectId,
          releaseId,
          addedTracksObjectIds,
          new ObjectId(payload.owner),
        );
      }
    }

    if (updateReleaseDto?.finalVersions) {
      const allFinalVersions = [
        ...finalVersions,
        ...updateReleaseDto.finalVersions,
      ];

      const allFinalVersionTracks = await this.trackModel.aggregate([
        {
          $match: {
            _id: { $in: allFinalVersions.map((id) => new ObjectId(id)) },
          },
        },
        {
          $project: {
            _id: 1,
            extension: 1,
          },
        },
      ]);

      const VIDEO_EXTENSIONS = ['mp4'];

      const uniqueFinalVersions = [];
      let videoFinalVersionCount = 0;
      let audioFinalVersionCount = 0;
      for (let i = 0; i < allFinalVersionTracks.length; i++) {
        const finalVersion = allFinalVersionTracks[i];
        if (!uniqueFinalVersions.includes(finalVersion?._id)) {
          uniqueFinalVersions.push(finalVersion);
        }

        const isVideo =
          VIDEO_EXTENSIONS.includes(finalVersion?.extension) ||
          finalVersion?.extension?.includes('video');

        if (isVideo) {
          videoFinalVersionCount += 1;
        } else {
          audioFinalVersionCount += 1;
        }
      }

      finalVersions = uniqueFinalVersions;

      if (finalVersions?.length > 2) {
        throw new ServiceException(
          `There can be at max 2 files in Final Versions.`,
          ExceptionsEnum.BadRequest,
        );
      }

      if (audioFinalVersionCount > 1 || videoFinalVersionCount > 1) {
        throw new ServiceException(
          `Final Verisions can include at max one audio and one video file.`,
          ExceptionsEnum.BadRequest,
        );
      }

      allTracks = [...allTracks, ...updateReleaseDto.finalVersions];

      const addedTracks = updateReleaseDto.finalVersions.filter(
        (track) => !originalFinalVersions.includes(track),
      );

      const addedFinalReleaseIds =
        addedTracks.map((track) => new ObjectId(track)) || [];

      await this.projectUpdateService.createAddedFilesToFinalRelease(
        projectId,
        releaseId,
        addedFinalReleaseIds,
        new ObjectId(payload.owner),
      );
    }

    if (allTracks.length) {
      allTracks = Array.from(new Set(allTracks));

      const projectTracks = await this.trackProjectModel
        .find()
        .where('projectId')
        .equals(release.project)
        .where('trackId')
        .in(allTracks)
        .exec();

      if (projectTracks.length !== allTracks.length) {
        resourceNotFoundError('Project x Tracks');
      }
    }

    if (updateReleaseDto?.name) {
      const releaseFound = await this.releaseModel
        .findOne()
        .where('project')
        .equals(release.project)
        .where('_id')
        .ne(payload.id)
        .where('name')
        .equals(updateReleaseDto.name);

      if (releaseFound) {
        resourceDuplicateError('Release');
      }
    }

    if (removeSelectedTracks) {
      const removedTracks = selectedTracks.filter(
        (track) => !removeSelectedTracks.includes(track),
      );
      selectedTracks = selectedTracks.filter((track) =>
        removeSelectedTracks.includes(track),
      );

      const removedTracksObjectIds = removedTracks.map(
        (track) => new ObjectId(track),
      );

      await this.projectUpdateService.createRemovedFilesFromRelease(
        projectId,
        releaseId,
        removedTracksObjectIds,
        new ObjectId(payload.owner),
      );
    }

    if (removeFinalVersions) {
      const removedFinalVersions = originalFinalVersions.filter(
        (track) => !removeFinalVersions.includes(track),
      );
      finalVersions = finalVersions.filter((track) =>
        removeFinalVersions.includes(track),
      );

      const removedTracksObjectIds = removedFinalVersions.map(
        (track) => new ObjectId(track),
      );

      await this.projectUpdateService.createRemovedFilesFromFinalRelease(
        projectId,
        releaseId,
        removedTracksObjectIds,
        new ObjectId(payload.owner),
      );
    }

    await this.verifyChangeSplitValue(release, updateReleaseDto);

    const formattedContracts = newContracts?.map((contract) => {
      const getAccepted = (): boolean => {
        if (hasUpdatedSplit) {
          return false;
        }

        const collab = project.collaborators.find(
          (collab: any) => collab.user?.toString() === contract.user.toString(),
        );

        // VIEW_ONLY members automatically accept the split. All
        // other members have the ability to accept or decline
        // the proposed split.
        if (collab?.permission === 'VIEW_ONLY') {
          return true;
        }

        return !!contract?.accepted;
      };

      return {
        ...contract,
        user: new ObjectId(contract.user),
        accepted: getAccepted(),
      };
    });

    const newRelease = {
      ...updateReleaseDto,
      contracts: formattedContracts,
      selectedTracks,
      finalVersions,
      fundDistributions: [
        ...existingFundDistributions,
        ...newFundDistributions,
      ],
    };

    await this.releaseModel.findByIdAndUpdate(payload.id, newRelease);

    if (hasChangedName) {
      await this.projectUpdateService.createRenamedRelease(
        projectId,
        releaseId,
        originalName,
        newName,
        new ObjectId(payload.owner),
      );
    }

    const [releaseUpdated] = await this.getAllReleases({ _id: payload.id });

    return releaseUpdated;
  }

  /**
   * Check if collaborator has accepted or rejected contract.
   *
   * @param {Contracts} oldUserContract
   * @param {Contracts} newUserContract
   * @returns {boolean}
   */
  private userHasAnsweredContractSplit(
    oldUserContract: Contracts,
    newUserContract: Contracts,
  ): boolean {
    const hasAnsweredContract =
      typeof newUserContract?.accepted !== undefined &&
      oldUserContract?.accepted !== newUserContract?.accepted;

    return hasAnsweredContract;
  }

  /**
   * Verify if the contract had a change in lastValueFrom
   */
  async verifyChangeSplitValue(
    release: ReleaseDocument,
    updateReleaseDto: UpdateReleasesDto,
  ) {
    updateReleaseDto.contracts?.forEach((contract) => {
      const result = release.contracts.find(
        (oldContract) =>
          contract.user === oldContract.user.toString() &&
          contract.split === oldContract.split,
      );

      if (!result) {
        contract.accepted = false;
      }
    });

    return;
  }

  /**
   * Remove release by id
   * @param payload Release id for exclude
   * @return Release exclude
   */
  async removeReleaseById(payload: { owner: string; id: string }) {
    const response = await this.releaseModel.findByIdAndDelete(payload.id);

    await this.notifiesService.deleteAllNotifiesByRelease(payload.id);

    lastValueFrom(
      this.clientKafka.send(
        GeneralDefinedExternalTopics.releaseWasDeleted.topic,
        {
          id: payload.id,
        },
      ),
    );

    return response;
  }

  /**
   * Remove releases by user
   * @param {string} userId User id that was remove all releases
   * @return Release exclude
   */
  async deleteReleasesByUser(userId: string): Promise<any> {
    return await this.releaseModel.deleteMany({
      $or: [
        { user: new ObjectId(userId) },
        { 'contracts.user': new ObjectId(userId) },
        { 'contracts.user': userId },
      ],
    });
  }

  /**
   * Get release by id
   * @param releaseId
   * @return Release
   */
  async getReleaseById({ releaseId }: { releaseId: string; owner?: string }) {
    console.log('release ID...', releaseId);
    const [releaseFound] = await this.getAllReleases({
      _id: new ObjectId(releaseId),
    });

    console.log('release found...', releaseFound);

    if (!releaseFound) {
      resourceNotFoundError('Release');
    }

    return releaseFound;
  }

  /**
   * Get release by project
   * @param projectId
   * @return Release
   */
  async getReleasesByProject(projectId: string) {
    return await this.getAllReleases({ project: new ObjectId(projectId) });
  }

  /**
   * Get all release
   * @return Releases
   */
  async getAllReleases(filters: any) {
    const releasesFound = await this.releaseModel
      .find(filters)
      .populate({
        path: 'selectedTracks',
        select:
          'name user_id imageWaveBig imageWaveSmall duration tags genre instrument extension _id previewStart previewEnd',
        populate: {
          path: 'user_id',
          model: 'User',
          select: 'name profile_img',
        },
      })
      .populate({
        path: 'finalVersions',
        select:
          'name user_id imageWaveBig imageWaveSmall duration tags genre instrument extension _id previewStart previewEnd',
        populate: {
          path: 'user_id',
          model: 'User',
          select: 'name profile_img',
        },
      })
      .populate({ path: 'user', select: 'name profile_img' })
      .populate({
        path: 'contracts',
        populate: {
          path: 'user',
          model: 'User',
          select: 'name profile_img',
        },
      });

    if (!releasesFound?.length) {
      resourceNotFoundError('Release');
    }

    const releases = JSON.parse(JSON.stringify(releasesFound));

    const trackNames = [];
    releases.forEach((release) => {
      const { finalVersions = [], selectedTracks = [] } = release || {};
      const allTracks = [...finalVersions, ...selectedTracks];
      allTracks.forEach((track) => {
        const foundTrack = trackNames.find((name) => name.includes(track._id));
        if (!foundTrack) {
          trackNames.push(`${track?._id}.${track.extension}`);
        }
      });
    });

    //Get all tracks url files from the client storage
    let trackUrls = [];
    try {
      trackUrls = await this.fileStorageService.getImageUrl({
        name: trackNames,
      });
    } catch (error) {
      throw new ServiceException(
        'Error getting images from tracks urls.' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }

    releases.forEach((release: any) => {
      release.finalVersions = release?.finalVersions?.map(
        ({ user_id, _id, ...rest }: any) => ({
          ...rest,
          _id,
          user: user_id,
          url: trackUrls.find((url) => url?.includes(_id)),
        }),
      );

      release.selectedTracks = release?.selectedTracks?.map(
        ({ user_id, _id, ...rest }: any) => ({
          ...rest,
          _id,
          user: user_id,
          url: trackUrls.find((url) => url?.includes(_id)),
        }),
      );

      release.contracts = release?.contracts?.filter(
        (contract: any) => contract.user?._id,
      );
    });

    return releases;
  }
}
