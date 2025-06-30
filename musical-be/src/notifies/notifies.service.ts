/**
 *  @file App main service file. Defines the services to be used in the microservice.
 *  @author Rafael Marques Siqueira
 *  @exports NotifiesService
 */

import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddCollaboratorDto } from './dto/AddCollaborator.dto';
import { RemoveCollaboratorDto } from './dto/RemoveCollaborator.dto';
import { NotifyTypeEnum } from './utils/enums';
import { ObjectId } from 'mongodb';
import { Events } from './utils/types';
import {
  Project,
  Track,
  Release,
  NotifyDocument,
  Notify,
  User,
  Checkout,
  LiveStream,
  Nft,
  NftExchange,
  GamificationEvent,
} from '@/src/schemas/schemas';
import { AddedTracksToReleaseDto } from './dto/addedTracksToRelease.dto';
import { RemovedTracksFromReleaseDto } from './dto/removedTracksFromRelease.dto';
import { AddedTracksToFinalVersionDto } from './dto/addedTracksToFinalVersion.dto';
import { RemovedTracksFromFinalVersionDto } from './dto/removedTracksFromFinalVersion.dto';
import { CommentedOnProjectDto } from './dto/commentedOnProject.dto';
import { UserFollowedYouDto } from './dto/userFollowedYou.dto';
import { UpdatedReleaseSplitsDto } from './dto/updatedReleaseSplits.dto';
import { UserAnsweredContractSplitDto } from './dto/userAnsweredContractSplit.dto';
import { PushNotificationsService } from './services/pushNotifications.service';
import { CreateContactInformationDto } from './dto/createContactInformation.dto';
import { AddReactedToActivityDto } from './dto/addReactedToActivity.dto';
import { AddCommentedOnActivityDto } from './dto/addCommentedOnActivity.dto';
import { AddTrackProjectDto } from './dto/addTrackProject.dto';
import { AddCommentOnTrack } from './dto/addComment';
import { Collaborator } from '../schemas/utils/types';
import { AddCollaborator } from './dto/addCollaborator';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';
import { UserActivityService } from '../user-activity/user-activity.service';
import { Quest } from '../schemas/schemas/quest';


// Please follow the doc https://visionnaire.atlassian.net/wiki/spaces/MUSICALOUT/pages/1052599713793/Notifications
// If you do some change, please refer that change in the doc above.

@Injectable()
export class NotifiesService {
  private configService: ConfigService<Record<string, unknown>, false>;

  constructor(
    private mailService: MailerService,
    private pushNotificationsService: PushNotificationsService,
    // private readonly userActivityService: UserActivityService,
    @InjectModel(Notify.name) private notifyModel: Model<NotifyDocument>,
    @InjectModel(Project.name) private projectModel: Model<Project>,
    @InjectModel(Release.name) private releaseModel: Model<Release>,
    @InjectModel(LiveStream.name) private liveStreamModel: Model<LiveStream>,
    @InjectModel(Nft.name) private nftModel: Model<Nft>,
    @InjectModel(NftExchange.name) private nftExchangeModel: Model<NftExchange>,
    @InjectModel(Track.name) private trackModel: Model<Track>,
    @InjectModel(GamificationEvent.name) private gamificationEventModel: Model<GamificationEvent>,
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Quest.name) private questModel: Model<Quest>,
    @InjectModel(Checkout.name) private checkOutModel: Model<Checkout>,
  ) {
    this.configService = new ConfigService();
  }

  async sendRegisterConfirmation({
    email,
    name,
    token,
    isMobile,
  }: {
    email: string;
    name: string;
    token: string;
    isMobile: boolean
  }): Promise<void> {
    const url = isMobile ? `${process.env.MOBILE_APP}/${token}` : `${this.configService.get<string>('APP_HOST',)}login?token=${token}`
    this.mailService.sendMail({
      to: email,
      subject: 'Confirmation of your account',
      template: 'confirmation_user',
      context: {
        name: name,
        url: url,
      },
    });
  }

  async sendResetPassword({
    email,
    name,
    token,
  }: {
    email: string;
    name: string;
    token: string;
  }): Promise<void> {
    return this.mailService.sendMail({
      to: email,
      subject: 'Reset your password',
      template: 'reset_password',
      context: {
        name: name,
        url: `${this.configService.get<string>(
          'APP_HOST',
        )}/reset-password?token=${token}`,
      },
    });
  }

  /**
   * Send invite by email to a user
   * @param param Informations to send invite by email
   */
  async sendInvitesUser({
    email,
    name,
    inviteCode,
    projectName,
  }: {
    email: string;
    name: string;
    inviteCode: string;
    projectName?: string;
  }): Promise<void> {
    const subject = projectName ? `You were invited to join ${projectName} by ${name}` : `You were invited to join Guild by ${name}`;
    this.mailService.sendMail({
      to: email,
      subject: subject,
      template: 'invite_user_new',
      context: {
        name: name,
        projectName: projectName,
        url: `${this.configService.get<string>(
          'APP_HOST',
        )}signup?inviteCode=${inviteCode}`,
        appAndroid: process.env.APP_ANDROID_URL,
        appIos: process.env.APP_IOS_URL,
      },
    });
  }


  /**
 * Send invite by email to a user
 * @param param Mail send to user that added in project as collaborator.
 */
  async sendInvitesCollaborator({
    email,
    name,
    projectName,
    projectId,
  }: {
    email: string;
    projectId: string;
    projectName: string;
    name: string;
  }): Promise<void> {
    this.mailService.sendMail({
      to: email,
      subject: `You were added as collaborator on Guild platform.`,
      template: 'collaborator',
      context: {
        name: name,
        projectName: projectName,
        url: `${this.configService.get<string>('APP_HOST',)}/project/${projectId}`,
        appAndroid: process.env.APP_ANDROID_URL,
        appIos: process.env.APP_IOS_URL,
      },
    });
  }

  /**
   * Notificaton for when user has been added to a project
   */
  async addCollaboratorToProject(collaboratorUpdateDto: AddCollaboratorDto) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.ADD_COLLABORATOR,
      from: new ObjectId(collaboratorUpdateDto.fromUserId),
      to: new ObjectId(collaboratorUpdateDto.toUserId),
      resource: new ObjectId(collaboratorUpdateDto.projectId),
      data: {
        projectId: new ObjectId(collaboratorUpdateDto.projectId),
        collaboratorName: collaboratorUpdateDto.collaboratorName,
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Notificaton for when user has been removed from a project
   */
  async removeCollaboratorFromProject(
    collaboratorUpdateDto: RemoveCollaboratorDto,
  ) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.REMOVE_COLLABORATOR,
      from: new ObjectId(collaboratorUpdateDto.fromUserId),
      to: new ObjectId(collaboratorUpdateDto.toUserId),
      resource: new ObjectId(collaboratorUpdateDto.projectId),
      data: {
        projectId: new ObjectId(collaboratorUpdateDto.projectId),
        collaboratorName: collaboratorUpdateDto.collaboratorName,
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Add notification to information about track was add
   */
  async addTrackProject(addTrackProjectDto: AddTrackProjectDto) {
    const projectName = await this.projectModel.findOne({ _id: addTrackProjectDto.projectId })
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.ADDED_TRACKS_TO_MAIN_FOLDER,
      from: new ObjectId(addTrackProjectDto.fromUserId),
      to: new ObjectId(addTrackProjectDto.toUserId),
      resource: new ObjectId(addTrackProjectDto.projectId),
      data: {
        trackIds: addTrackProjectDto.trackIds,
        projectName: projectName?.name,
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Get all notifications of a user
   */
  async getAllFromUser({
    userId,
    viewed,
  }: {
    userId: string;
    viewed: 'ALL' | 'SEEN' | 'NOT_SEEN';
  }): Promise<NotifyDocument[]> {
    const query = this.notifyModel
      .find()
      .where('to')
      .equals(userId)
      .populate({ path: 'from', select: 'name profile_img', model: 'User' })
      .populate({ path: 'to', select: 'name profile_img', model: 'User' })
      .sort('-createdAt')
      .select('-__v');

    if (viewed && viewed !== 'ALL') {
      query.where('viewed').equals(viewed === 'SEEN' ? true : false);
    }

    const notifies = await query.exec();
    const notifications = JSON.parse(JSON.stringify(notifies));

    const notifiesWithResourcesPromises = notifications.map(
      async (notification: Record<keyof Notify, any>) => {
        const resourceIsProject = [
          NotifyTypeEnum.ADD_COLLABORATOR,
          NotifyTypeEnum.REMOVE_COLLABORATOR,
          NotifyTypeEnum.ADDED_TRACKS_TO_RELEASE,
          NotifyTypeEnum.REMOVED_TRACKS_FROM_RELEASE,
          NotifyTypeEnum.ADDED_TRACKS_TO_FINAL_VERSION,
          NotifyTypeEnum.REMOVED_TRACKS_FROM_FINAL_VERSION,
          NotifyTypeEnum.COMMENTED_ON_PROJECT,
          NotifyTypeEnum.UPDATED_RELEASE_SPLITS,
          NotifyTypeEnum.USER_ANSWERED_CONTRACT_SPLIT,
          NotifyTypeEnum.COLLABORATOR_REQ,
          NotifyTypeEnum.COLLABORATOR_ADDED,
        ].includes(notification.type);

        const resourceIsNft = [
          NotifyTypeEnum.NFT_BUY,
        ].includes(notification.type);

        const resourceIsGamificationToken = [
          NotifyTypeEnum.GAMIFICATION_TOKENS,
        ].includes(notification.type);

        const resourceIsQuestToken = [
          NotifyTypeEnum.MISSION_COMPLETED,
        ].includes(notification.type);

        const resourceIsQuestPerformed = [
          NotifyTypeEnum.MISSION_PERFORMED,
        ].includes(notification.type);

        const resourceIsNftExchange = [
          NotifyTypeEnum.NFT_EXCHANGE_APPROVED,
        ].includes(notification.type);

        const resourceIsTrack = [
          NotifyTypeEnum.COMMENTED_ON_TRACK,
        ].includes(notification.type);


        const resourceIsTrackFolder = [
          NotifyTypeEnum.ADDED_TRACKS_TO_MAIN_FOLDER,
        ].includes(notification.type);

        const resourceIsUser = [
          NotifyTypeEnum.ACCEPT_INVITATION,
        ].includes(notification.type);

        const resourceIsStream = [
          NotifyTypeEnum.PUBLIC_STREAM,
          NotifyTypeEnum.PRIVATE_STREAM,
        ].includes(notification.type);

        if (resourceIsGamificationToken) {
          notification = await this.getGamificationNotification(notification);
        }

        if (resourceIsQuestToken) {
          notification = await this.getQuestNotification(notification);
        }

        if (resourceIsQuestPerformed) {
          notification = await this.getQuestPerformedNotification(notification);
        }

        if (resourceIsTrackFolder) {
          notification = await this.getTrackFolderNotification(notification);
        }

        if (resourceIsTrack) {
          notification = await this.getTrackNotification(notification);
        }

        if (resourceIsNftExchange) {
          notification = await this.getNftExchangeNotification(notification);
        }

        if (resourceIsNft) {
          notification = await this.getNftNotification(notification);
        }

        if (resourceIsStream) {
          notification = await this.getStreamNotification(notification);
        }

        if (resourceIsUser) {
          notification = await this.getUserNotification(notification);
        }

        if (resourceIsProject) {
          notification = await this.getProjectNotification(notification);
        }

        return notification;
      },
    );
    const notifiesWithResources = await Promise.all(
      notifiesWithResourcesPromises,
    );

    return notifiesWithResources;
  }

  private async getNotificationData(notificationId: ObjectId) {
    const queriedNotification = await this.notifyModel
      .findOne()
      .where('_id')
      .equals(notificationId)
      .populate({ path: 'from', select: 'name profile_img', model: 'User' })
      .populate({ path: 'to', select: 'name profile_img', model: 'User' })
      .select('-__v')
      .exec();

    const resourceIsProject = [
      NotifyTypeEnum.ADD_COLLABORATOR,
      NotifyTypeEnum.REMOVE_COLLABORATOR,
      NotifyTypeEnum.ADDED_TRACKS_TO_RELEASE,
      NotifyTypeEnum.REMOVED_TRACKS_FROM_RELEASE,
      NotifyTypeEnum.ADDED_TRACKS_TO_FINAL_VERSION,
      NotifyTypeEnum.REMOVED_TRACKS_FROM_FINAL_VERSION,
      NotifyTypeEnum.COMMENTED_ON_PROJECT,
      NotifyTypeEnum.UPDATED_RELEASE_SPLITS,
      NotifyTypeEnum.USER_ANSWERED_CONTRACT_SPLIT,
      NotifyTypeEnum.COMMENTED_ON_TRACK,
      NotifyTypeEnum.NFT_EXCHANGE_APPROVED,
      NotifyTypeEnum.NFT_BUY,
      NotifyTypeEnum.COLLABORATOR_REQ,
      NotifyTypeEnum.ADDED_TRACKS_TO_MAIN_FOLDER,
      NotifyTypeEnum.GAMIFICATION_TOKENS,
      NotifyTypeEnum.MISSION_COMPLETED,
      NotifyTypeEnum.MISSION_PERFORMED
    ].includes(queriedNotification.type);

    if (resourceIsProject) {
      return JSON.parse(
        JSON.stringify(
          await this.getProjectNotification(
            queriedNotification.toObject({ flattenMaps: true }),
          ),
        ),
      );
    }

    return JSON.parse(
      JSON.stringify(queriedNotification.toObject({ flattenMaps: true })),
    );
  }

  private async getStreamNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.liveStreamModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('title')
      .exec();

    const streamData =
      [
        NotifyTypeEnum.PRIVATE_STREAM,
        NotifyTypeEnum.PUBLIC_STREAM,
      ].includes(notification.type) && !!notification.data?.liveStreamId;

    if (streamData) {
      newNotification.data.liveStreamId = await this.liveStreamModel
        .findOne()
        .where('_id')
        .equals(notification.data.liveStreamId)
        .select('title')
        .exec();
    }

    return newNotification;
  }

  private async getUserNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.userModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('username')
      .exec();

    const invData =
      [
        NotifyTypeEnum.ACCEPT_INVITATION,
      ].includes(notification.type) && !!notification.data?.userId;


    if (invData) {
      newNotification.data.userId = await this.userModel
        .findOne()
        .where('_id')
        .equals(notification.data.userId)
        .select('username')
        .exec();
    }
    return newNotification;
  }

  private async getTrackFolderNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.projectModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('name')
      .exec();

    const trackData =
      [
        NotifyTypeEnum.ADDED_TRACKS_TO_MAIN_FOLDER,
      ].includes(notification.type) && !!notification.data?.trackIds;

    if (trackData) {
      newNotification.data.trackIds = await this.trackModel
        .find()
        .where('_id')
        .in(notification.data.trackIds)
        .select('name')
        .exec();
    }
    return newNotification;
  }

  private async getQuestNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.userModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('name')
      .exec();

    const data =
      [
        NotifyTypeEnum.MISSION_COMPLETED,
      ].includes(notification.type) && !!notification.data?.eventId;

    if (data) {
      newNotification.data.eventId = await this.questModel
        .findOne()
        .where('_id')
        .in(notification.data.eventId)
        .select('name points')
        .exec();
    }
    return newNotification;
  }


  private async getQuestPerformedNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.userModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('name')
      .exec();

    const data =
      [
        NotifyTypeEnum.MISSION_PERFORMED,
      ].includes(notification.type) && !!notification.data?.eventId;

    if (data) {
      newNotification.data.eventId = await this.questModel
        .findOne()
        .where('_id')
        .in(notification.data.eventId)
        .select('name points')
        .exec();
    }
    return newNotification;
  }


  private async getGamificationNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.userModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('name')
      .exec();

    const trackData =
      [
        NotifyTypeEnum.GAMIFICATION_TOKENS,
      ].includes(notification.type) && !!notification.data?.eventId;

    if (trackData) {
      newNotification.data.eventId = await this.gamificationEventModel
        .findOne()
        .where('_id')
        .in(notification.data.eventId)
        .select('name points')
        .exec();
    }
    return newNotification;
  }

  private async getTrackNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.projectModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('name')
      .exec();

    const trackData =
      [
        NotifyTypeEnum.COMMENTED_ON_TRACK,
      ].includes(notification.type) && !!notification.data?.trackId;

    if (trackData) {
      newNotification.data.trackId = await this.trackModel
        .findOne()
        .where('_id')
        .equals(notification.data.trackId)
        .select('name')
        .exec();
    }

    return newNotification;
  }

  private async getNftExchangeNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.nftExchangeModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('exchangeId')
      .exec();

    const nftExData =
      [
        NotifyTypeEnum.NFT_EXCHANGE_APPROVED,
      ].includes(notification.type) && !!notification.data?.exchangeId;

    if (nftExData) {
      newNotification.data.exchangeId = await this.nftExchangeModel
        .findOne()
        .where('_id')
        .equals(notification.data.exchangeId)
        .select('_id')
        .exec();
    }

    return newNotification;
  }

  private async getNftNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.nftModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('title')
      .exec();

    const nftData =
      [
        NotifyTypeEnum.NFT_BUY,
      ].includes(notification.type) && !!notification.data?.nftId;

    if (nftData) {
      newNotification.data.nftId = await this.nftModel
        .findOne()
        .where('_id')
        .equals(notification.data.nftId)
        .select('title')
        .exec();
    }

    return newNotification;
  }


  private async getProjectNotification(
    notification: Record<keyof Notify, any>,
  ) {
    const newNotification = { ...notification };
    newNotification.resource = await this.projectModel
      .findOne()
      .where('_id')
      .equals(notification.resource)
      .select('name')
      .exec();

    const isAboutARelease =
      [
        NotifyTypeEnum.ADDED_TRACKS_TO_RELEASE,
        NotifyTypeEnum.REMOVED_TRACKS_FROM_RELEASE,
        NotifyTypeEnum.ADDED_TRACKS_TO_FINAL_VERSION,
        NotifyTypeEnum.REMOVED_TRACKS_FROM_FINAL_VERSION,
        NotifyTypeEnum.UPDATED_RELEASE_SPLITS,
        NotifyTypeEnum.USER_ANSWERED_CONTRACT_SPLIT,
      ].includes(notification.type) && !!notification.data?.releaseId;

    const containsTracksOnData =
      [
        NotifyTypeEnum.ADDED_TRACKS_TO_RELEASE,
        NotifyTypeEnum.REMOVED_TRACKS_FROM_RELEASE,
        NotifyTypeEnum.ADDED_TRACKS_TO_FINAL_VERSION,
        NotifyTypeEnum.REMOVED_TRACKS_FROM_FINAL_VERSION,
        NotifyTypeEnum.ADDED_TRACKS_TO_MAIN_FOLDER,
      ].includes(notification.type) && !!notification.data?.trackIds;

    const containsTrackData =
      [
        NotifyTypeEnum.COMMENTED_ON_TRACK,
      ].includes(notification.type) && !!notification.data?.trackId;

    const containsEventData =
      [
        NotifyTypeEnum.GAMIFICATION_TOKENS,
      ].includes(notification.type) && !!notification.data?.eventId;

    const containsQuestData =
      [
        NotifyTypeEnum.MISSION_COMPLETED,
      ].includes(notification.type) && !!notification.data?.eventId;

    const containsQuestPerformedData =
      [
        NotifyTypeEnum.MISSION_PERFORMED,
      ].includes(notification.type) && !!notification.data?.eventId;

    const collabData =
      [
        NotifyTypeEnum.COLLABORATOR_ADDED,
      ].includes(notification.type) && !!notification.data?.trackId;

    const collabReqData =
      [
        NotifyTypeEnum.COLLABORATOR_REQ,
      ].includes(notification.type) && !!notification.data?.projectId;

    const collabAdded =
      [
        NotifyTypeEnum.ADD_COLLABORATOR,
        NotifyTypeEnum.REMOVE_COLLABORATOR,
      ].includes(notification.type) && !!notification.data?.projectId;

    const nftBuy =
      [
        NotifyTypeEnum.NFT_BUY,
      ].includes(notification.type) && !!notification.data?.nftId;

    const nftExchange =
      [
        NotifyTypeEnum.NFT_EXCHANGE_APPROVED,
      ].includes(notification.type) && !!notification.data?.exchangeId;

    if (containsEventData) {
      newNotification.data.eventId = await this.gamificationEventModel
        .findOne()
        .where('_id')
        .equals(notification.data.eventId)
        .select('name points')
        .exec();
    }

    if (containsQuestPerformedData) {
      newNotification.data.eventId = await this.questModel
        .findOne()
        .where('_id')
        .equals(notification.data.eventId)
        .select('name points')
        .exec();
    }

    if (containsQuestData) {
      newNotification.data.eventId = await this.questModel
        .findOne()
        .where('_id')
        .equals(notification.data.eventId)
        .select('name points')
        .exec();
    }

    if (nftExchange) {
      newNotification.data.exchangeId = await this.nftExchangeModel
        .findOne()
        .where('_id')
        .equals(notification.data.exchangeId)
        .select('exchangeId')
        .exec();
    }

    if (nftBuy) {
      newNotification.data.nftId = await this.nftModel
        .findOne()
        .where('_id')
        .equals(notification.data.nftId)
        .select('title')
        .exec();
    }

    if (collabAdded) {
      newNotification.data.projectId = await this.projectModel
        .findOne()
        .where('_id')
        .equals(notification.data.projectId)
        .select('name')
        .exec();
    }

    if (collabData) {
      newNotification.data.trackId = await this.trackModel
        .findOne()
        .where('_id')
        .equals(notification.data.trackId)
        .select('name')
        .exec();
    }

    if (collabReqData) {
      newNotification.data.projectId = await this.projectModel
        .findOne()
        .where('_id')
        .equals(notification.data.projectId)
        .select('name')
        .exec();
    }

    if (containsTrackData) {
      newNotification.data.trackId = await this.trackModel
        .findOne()
        .where('_id')
        .equals(notification.data.trackId)
        .select('name')
        .exec();
    }

    if (isAboutARelease) {
      newNotification.data.release = await this.releaseModel
        .findOne()
        .where('_id')
        .equals(notification.data.releaseId)
        .select('name')
        .exec();
    }

    if (containsTracksOnData) {
      newNotification.data.tracks = await this.trackModel
        .find()
        .where('_id')
        .in(notification.data.trackIds)
        .select('name')
        .exec();
    }

    return newNotification;
  }

  /**
   * Update notify to viewed true status
   */
  async updateNotifyById({
    owner,
    id,
    fields,
  }: {
    owner: string;
    id: string;
    fields: any;
  }): Promise<NotifyDocument> {
    await this.notifyModel.updateOne({ _id: id, to: owner }, fields);
    return this.notifyModel.findById(id);
  }

  async registerChatEvent({ event }: { event: Events }) {
    if (event.type == 'message.new') {
      for (const member of event.members.filter(
        (x) => x.user_id != event.message.user.id,
      )) {
        const entry = await this.notifyModel.findOne({
          identifier: event.channel_id,
          from: new ObjectId(event.message.user.id),
          to: new ObjectId(member.user_id),
          viewed: false,
        });

        if (!entry) {
          const newNotify = new this.notifyModel({
            type: NotifyTypeEnum.CHAT,
            from: new ObjectId(event.message.user.id),
            to: new ObjectId(member.user_id),
            resource: null,
            viewed: false,
            identifier: event.channel_id,
            data: {
              channel_type: event.channel_type,
            },
          });

          const saved = await newNotify.save();

          this.sendAsPushNotification(newNotify);

          return saved;
        }
      }
    }

    return;
  }

  /**
   * Add notification to inform that a track was added to a release.
   *
   * @param {AddedTracksToReleaseDto} addedTracksToReleaseDto
   * @returns {Promise<void>}
   */
  async addAddedTracksToRelease(
    addedTracksToReleaseDto: AddedTracksToReleaseDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.ADDED_TRACKS_TO_RELEASE,
      from: new ObjectId(addedTracksToReleaseDto.fromUserId),
      to: new ObjectId(addedTracksToReleaseDto.toUserId),
      resource: new ObjectId(addedTracksToReleaseDto.projectId),
      data: {
        releaseId: new ObjectId(addedTracksToReleaseDto.releaseId),
        trackIds: addedTracksToReleaseDto.trackIds.map(
          (trackId) => new ObjectId(trackId),
        ),
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Add notification to inform that a track was removed from a release.
   *
   * @param {RemovedTracksFromReleaseDto} removedTracksToReleaseDto
   * @returns {Promise<void>}
   */
  async addRemovedTracksFromRelease(
    removedTracksToReleaseDto: RemovedTracksFromReleaseDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.REMOVED_TRACKS_FROM_RELEASE,
      from: new ObjectId(removedTracksToReleaseDto.fromUserId),
      to: new ObjectId(removedTracksToReleaseDto.toUserId),
      resource: new ObjectId(removedTracksToReleaseDto.projectId),
      data: {
        releaseId: new ObjectId(removedTracksToReleaseDto.releaseId),
        trackIds: removedTracksToReleaseDto.trackIds.map(
          (trackId) => new ObjectId(trackId),
        ),
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Add notification to inform that tracks were added to a final version.
   *
   * @param {AddedTracksToFinalVersionDto} addedTracksToFinalVersionDto
   * @returns {Promise<void>}
   */
  async addAddedTracksToFinalVersion(
    addedTracksToFinalVersionDto: AddedTracksToFinalVersionDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.ADDED_TRACKS_TO_FINAL_VERSION,
      from: new ObjectId(addedTracksToFinalVersionDto.fromUserId),
      to: new ObjectId(addedTracksToFinalVersionDto.toUserId),
      resource: new ObjectId(addedTracksToFinalVersionDto.projectId),
      data: {
        releaseId: new ObjectId(addedTracksToFinalVersionDto.releaseId),
        trackIds: addedTracksToFinalVersionDto.trackIds.map(
          (trackId) => new ObjectId(trackId),
        ),
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Add notification to inform that tracks were added to a final version.
   *
   * @param {RemovedTracksFromFinalVersionDto} removedTracksFromFinalVersionDto
   * @returns {Promise<void>}
   */
  async addRemovedTracksFromFinalVersion(
    removedTracksFromFinalVersionDto: RemovedTracksFromFinalVersionDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.REMOVED_TRACKS_FROM_FINAL_VERSION,
      from: new ObjectId(removedTracksFromFinalVersionDto.fromUserId),
      to: new ObjectId(removedTracksFromFinalVersionDto.toUserId),
      resource: new ObjectId(removedTracksFromFinalVersionDto.projectId),
      data: {
        releaseId: new ObjectId(removedTracksFromFinalVersionDto.releaseId),
        trackIds: removedTracksFromFinalVersionDto.trackIds.map(
          (trackId) => new ObjectId(trackId),
        ),
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Add notification to inform that someone commented on a project.
   *
   * @param {CommentedOnProjectDto} commentedOnProjectDto
   * @returns {Promise<void>}
   */
  async addCommentedOnAProject(
    commentedOnProjectDto: CommentedOnProjectDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.COMMENTED_ON_PROJECT,
      from: new ObjectId(commentedOnProjectDto.fromUserId),
      to: new ObjectId(commentedOnProjectDto.toUserId),
      resource: new ObjectId(commentedOnProjectDto.projectId),
      data: {
        comment: commentedOnProjectDto.comment,
      },
      viewed: false,
    });

    await newNotify.save();

    //this.sendAsPushNotification(newNotify); Push notifications disabled here see the doc
  }

  /**
   * Add notification to inform that someone reacted to an activity.
   *
   * @param {AddReactedToActivityDto} addReactedToActivityDto
   * @returns {Promise<void>}
   */
  async addReactedToActivity(
    addReactedToActivityDto: AddReactedToActivityDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.USER_REACTED_TO_ACTIVITY,
      from: new ObjectId(addReactedToActivityDto.fromUserId),
      to: new ObjectId(addReactedToActivityDto.toUserId),
      data: {
        activityId: addReactedToActivityDto.activityId,
        reactionId: addReactedToActivityDto.reactionId,
        reactionType: addReactedToActivityDto.reactionType,
      },
      viewed: false,
    });

    await newNotify.save();

    //  this.sendAsPushNotification(newNotify); Push notifications disabled here, see the doc
  }

  /**
   * Add notification to inform that someone commented on an activity.
   *
   * @param {CommentedOnProjectDto} commentedOnProjectDto
   * @returns {Promise<void>}
   */
  async addCommentedOnActivity(
    addCommentedOnActivityDto: AddCommentedOnActivityDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.USER_COMMENTED_ON_ACTIVITY,
      from: new ObjectId(addCommentedOnActivityDto.fromUserId),
      to: new ObjectId(addCommentedOnActivityDto.toUserId),
      data: {
        activityId: addCommentedOnActivityDto.activityId,
        commentId: addCommentedOnActivityDto.commentId,
        comment: addCommentedOnActivityDto.comment,
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Add notification to inform that someone commented on a project.
   *
   * @param {UserFollowedYouDto} commentedOnProjectDto
   * @returns {Promise<void>}
   */
  async addUserFollowedYou(
    userFollowedYouDto: UserFollowedYouDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.USER_FOLLOWED_YOU,
      from: new ObjectId(userFollowedYouDto.fromUserId),
      to: new ObjectId(userFollowedYouDto.toUserId),
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Add notification to inform that someone update splits of a release
   *
   * @param {UpdatedReleaseSplitsDto} updatedReleaseSplitsDto
   * @returns {Promise<void>}
   */
  async addUpdatedReleaseSplits(
    updatedReleaseSplitsDto: UpdatedReleaseSplitsDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.UPDATED_RELEASE_SPLITS,
      from: new ObjectId(updatedReleaseSplitsDto.fromUserId),
      to: new ObjectId(updatedReleaseSplitsDto.toUserId),
      resource: new ObjectId(updatedReleaseSplitsDto.projectId),
      data: {
        releaseId: new ObjectId(updatedReleaseSplitsDto.releaseId),
      },
      viewed: false,
    });

    await newNotify.save();

    // this.sendAsPushNotification(newNotify); // Notificatios disabled here, see the doc
  }

  /**
   * Add notification to inform that someone update splits of a release
   *
   * @param {UserAnsweredContractSplit} userAnsweredContractSplitDto
   * @returns {Promise<void>}
   */
  async addUserAnsweredContractSplit(
    userAnsweredContractSplitDto: UserAnsweredContractSplitDto,
  ): Promise<void> {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.USER_ANSWERED_CONTRACT_SPLIT,
      from: new ObjectId(userAnsweredContractSplitDto.fromUserId),
      to: new ObjectId(userAnsweredContractSplitDto.toUserId),
      resource: new ObjectId(userAnsweredContractSplitDto.projectId),
      data: {
        releaseId: new ObjectId(userAnsweredContractSplitDto.releaseId),
        accepted: userAnsweredContractSplitDto.accepted,
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  /**
   * Delete all notifies that contain certain user id
   * @param {string} userId User id that will be cleared
   */
  async deleteAllNotifiesByUser(userId: string) {
    const id = new ObjectId(userId);
    await this.notifyModel.deleteMany({ $or: [{ to: id }, { from: id }] });
  }

  /**
   * Delete all notifies that contain certain release id
   * @param {string} releaseId Release id that will be cleared
   */
  async deleteAllNotifiesByRelease(releaseId: string) {
    const id = new ObjectId(releaseId);
    await this.notifyModel.deleteMany({ 'data.releaseId': id });
  }

  /**
   * Deletes all notifications that contain certain activity id.
   *
   * @param {string} activityId
   */
  async deleteAllNotifiesByActivity(activityId: string) {
    await this.notifyModel.deleteMany({ 'data.activityId': activityId });
  }

  /**
   * Deletes all notifications that contain certain reaction id.
   *
   * @param {string} reactionId
   */
  async deleteAllNotifiesByReaction(reactionId: string) {
    await this.notifyModel.deleteMany({ 'data.reactionId': reactionId });
  }

  /**
   * Deletes all notifications that contain certain comment id.
   *
   * @param {string} commentId
   */
  async deleteAllNotifiesByActivityComment(commentId: string) {
    await this.notifyModel.deleteMany({ 'data.commentId': commentId });
  }

  /**
   * Send notification as push notification.
   *
   * @param {NotifyDocument} notify
   * @returns {Promise<void>}
   */
  private async sendAsPushNotification(
    notify: NotifyDocument & { _id: ObjectId },
  ): Promise<void> {
    try {
      const completeNotification = await this.getNotificationData(notify._id);

      this.pushNotificationsService.sendPushNotification(
        completeNotification as Notify,
      );
    } catch (e) {
      console.log('Error sending push notification', e);
    }
  }

  /**
   * Create contact informations
   * @param {CreateContactInformationDto} fields Informations to create contact
   * @returns null
   */
  async createContactInformations(fields: CreateContactInformationDto) {
    return await this.mailService.sendMail({
      to: this.configService.get<string>('EMAIL_CONTACT'),
      subject: fields.topic,
      template: 'contact_user',
      context: {
        firstName: fields.firstName,
        lastName: fields.lastName,
        email: fields.email,
        company: fields.company,
        message: fields.message,
      },
    });
  }

  async markAllAsRead({ userId }: { userId: string }) {
    try {
      await this.notifyModel.updateMany(
        {
          to: new ObjectId(userId),
        },
        {
          $set: {
            viewed: true,
          },
        },
      );
      return true;
    } catch (err) {
      return null;
    }
  }

  async markAsRead({ userId, id }: { userId: string, id: string }) {
    try {
      await this.notifyModel.updateOne(
        {
          _id: new ObjectId(id),
          to: new ObjectId(userId),
        },
        {
          $set: {
            viewed: true,
          },
        },
      );
      return true;
    } catch (err) {
      return null;
    }
  }

  async deleteProjectNotifications({
    projectId,
  }: {
    projectId: ObjectId | string;
  }) {
    await this.notifyModel.deleteMany({
      $or: [
        {
          resource: new ObjectId(projectId),
        },
        {
          'data.projectId': new ObjectId(projectId),
        },
      ],
    });
    return true;
  }

  async sendInviteEmail(owner, fields) {
    const user = await this.userModel.findById(new ObjectId(owner?.toString()));
    if (fields.type == 'email') {
      await this.sendInvitesUser({
        email: fields.email,
        name: user.name,
        projectName: fields.projectName,
        inviteCode: owner,
      });

      //gamification token assign
      // await this.userActivityService.activity(user._id.toString(), EventTypeEnum.INVITE_USERS_PLATFORM)

      return 'Invite sent successfully!';
    }
  }

  private getUser(project: Project, authorId: String) {
    const projectCollaborators = project.collaborators
      .filter((collaborator) => !collaborator.invitedForProject)
      .map((collaborator: Collaborator) => collaborator.user.toString());
    const projectOwner = project.user.toString();
    const userIsCollaborator = projectCollaborators.includes(
      authorId.toString(),
    );
    const target = userIsCollaborator
      ? [
        projectOwner,
        ...projectCollaborators.filter(
          (user) => user?.toString() !== authorId?.toString(),
        ),
      ]
      : projectCollaborators;

    // If author is the owner, send only to collaborators, otherwise send for
    //  other collaborators and the owner
    return target;
  }


  async addCommentOnTrack(addCommentOnTrack: AddCommentOnTrack) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.COMMENTED_ON_TRACK,
      from: new ObjectId(addCommentOnTrack.fromUserId),
      to: new ObjectId(addCommentOnTrack.toUserId),
      resource: new ObjectId(addCommentOnTrack.projectId),
      data: {
        trackId: addCommentOnTrack.trackId,
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }


  async addedCommentToTrack(
    projectId: String,
    authorId: String,
    trackId: String
  ) {
    const project = await this.projectModel.findById(projectId);

    const targets = this.getUser(project, authorId);

    await Promise.all(
      targets.map(async (target) => {
        this.addCommentOnTrack({
          projectId: projectId?.toString(),
          fromUserId: authorId?.toString(),
          trackId: trackId?.toString(),
          toUserId: target?.toString(),
        });
      }),
    );
  }

  async collaboratorOppSend(addCollaborator: AddCollaborator) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.COLLABORATOR_ADDED,
      from: new ObjectId(addCollaborator.fromUserId),
      to: new ObjectId(addCollaborator.toUserId),
      resource: new ObjectId(addCollaborator.projectId),
      data: {
        projectId: addCollaborator.projectId,
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }


  async getSkillUser(authorId: String, uniqueStyles: any) {
    const users = await this.userModel.find();

    const matchingUsers = users
      .filter(user =>
        user.styles.some(style => uniqueStyles.includes(style)) && user._id.toString() !== authorId.toString()
      )
      .map(user => user._id.toString());

    const target = matchingUsers;

    return target;
  }

  async collaboratorOpp(projectId: String, authorId: String, uniqueStyles: any) {
    const targets = await this.getSkillUser(authorId, uniqueStyles);

    await Promise.all(
      targets.map(async (target) => {
        this.collaboratorOppSend({
          projectId: projectId?.toString(),
          fromUserId: authorId?.toString(),
          toUserId: target?.toString(),
        });
      }),
    );
  }

  async collabReq(projectId: string, toUserId: string, fromUserId: string,) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.COLLABORATOR_REQ,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(projectId),
      data: {
        projectId: projectId,
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  async acceptInvitation(toUserId: string, fromUserId: string) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.ACCEPT_INVITATION,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(fromUserId),
      data: {
        userId: new ObjectId(fromUserId),
      },
      viewed: false,
    });

    await newNotify.save();

    this.sendAsPushNotification(newNotify);
  }

  async publicStreamNotify(liveStreamId: string, fromUserId: string, toUserId: string, scheduleDate: any, formattedUTC: string) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.PUBLIC_STREAM,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(liveStreamId),
      data: {
        liveStreamId: liveStreamId,
        scheduleDate: scheduleDate,
        formattedUTC: formattedUTC
      },
      viewed: false,
    });
    await newNotify.save();
    this.sendAsPushNotification(newNotify);
  }

  async getAllUser() {
    const target = await this.userModel.find();
    return target;
  }

  async publicStream(liveStreamId: string, fromUserId: string, scheduleDate: any, formattedUTC: string) {
    const targets = await this.getAllUser();

    await Promise.all(
      targets.map(async (target) => {
        await this.publicStreamNotify(liveStreamId, fromUserId, target._id.toString(), scheduleDate, formattedUTC);
      }),
    );
  }

  async privateStreamNotify(liveStreamId: string, fromUserId: string, toUserId: string, scheduleDate, formattedUTC, tokenId: any) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.PRIVATE_STREAM,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(tokenId),
      data: {
        liveStreamId: liveStreamId,
        scheduleDate: scheduleDate,
        formattedUTC: formattedUTC
      },
      viewed: false,
    });
    await newNotify.save();
    this.sendAsPushNotification(newNotify);
  }

  async getTokenUser(tokenId: (string | ObjectId)) {
    const nfts = await this.checkOutModel.find({ nft: tokenId });
    const buyerIds = nfts.map(nft => nft.buyer);
    // const users = await this.userModel.find({
    //   'wallets.addr': { $in: buyerIds },
    // });
    const regexFilters = buyerIds.map((id) => ({
      'wallets.addr': new RegExp(`^${id}$`, 'i'),
    }));

    const users = await this.userModel.find({ $or: regexFilters });
    const target = users.map(user => user._id)
    return target;
  }

  async privateStream(liveStreamId: string, fromUserId: string, tokenIds: (string | ObjectId)[], scheduleDate: any, formattedUTC: string) {
    await Promise.all(
      tokenIds.map(async (tokenId) => {
        const targets = await this.getTokenUser(tokenId);

        await Promise.all(
          targets.map((targetId) =>
            this.privateStreamNotify(liveStreamId, fromUserId, targetId.toString(), scheduleDate, formattedUTC, tokenId)
          )
        );
      })
    );
  }

  async nftBuy(nftId: string, fromUserId: string, toUserId: string, projectId: string) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.NFT_BUY,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(nftId),
      data: {
        nftId: nftId,
        projectId: projectId
      },
      viewed: false,
    });
    await newNotify.save();
    this.sendAsPushNotification(newNotify);
  }

  async nftExchangeApproval(exchangeId: string, fromUserId: string, toUserId: string) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.NFT_EXCHANGE_APPROVED,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(exchangeId),
      data: {
        exchangeId: exchangeId,
      },
      viewed: false,
    });
    await newNotify.save();
    this.sendAsPushNotification(newNotify);
  }

  async eventTokens(eventId: string, fromUserId: string, toUserId: string) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.GAMIFICATION_TOKENS,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(toUserId),
      data: {
        eventId: eventId,
      },
      viewed: false,
    });
    await newNotify.save();
    this.sendAsPushNotification(newNotify);
  }

  async adminQuest(eventId: string, fromUserId: string, toUserId: string) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.MISSION_COMPLETED,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(toUserId),
      data: {
        eventId: eventId,
      },
      viewed: false,
    });
    await newNotify.save();
    this.sendAsPushNotification(newNotify);
  }


  async questPerformed(eventId: string, fromUserId: string, toUserId: string) {
    const newNotify = new this.notifyModel({
      type: NotifyTypeEnum.MISSION_PERFORMED,
      from: new ObjectId(fromUserId),
      to: new ObjectId(toUserId),
      resource: new ObjectId(toUserId),
      data: {
        eventId: eventId,
      },
      viewed: false,
    });
    await newNotify.save();
    this.sendAsPushNotification(newNotify);
  }
}