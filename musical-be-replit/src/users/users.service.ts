import { InjectRedis } from '@liaoliaots/nestjs-redis';
import { HttpException, HttpStatus, Inject, Injectable, forwardRef } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Redis } from 'ioredis';
// TODO: Remove after properly login in mobile
import { sign } from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { Document, Model, Types as MongooseTypes, FilterQuery } from 'mongoose';
import fetch from 'node-fetch';
import { lastValueFrom } from 'rxjs';
import { CreateCollabDto, UpdateCollabDto } from './dto/collaboration';
import { CreateCollabItemDto } from './dto/collaboration/createItem.dto';
import { UpdateCollabItemDto } from './dto/collaboration/updateItem.dto';
import { createRegisterDto } from './dto/createRegister.dto';
// Dtos imports
import { CreateUserDto } from './dto/createUser.dto';
import { ResetPasswordDto } from './dto/password_reset/resetPassword.dto';
import { SessionUserDto } from './dto/sessionUser.dto';
import { AddSkillDto } from './dto/addSkill.dto';
import { AddStyleDto } from './dto/style/addStyle.dto';
import { UpdateImageDto } from './dto/updateImage.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { ValidateUserDto } from './dto/validateUser.dto';
// Schemas imports
import {
  Account,
  AccountDocument,
  City,
  CityDocument,
  Collaboration,
  CollaborationDocument,
  Country,
  CountryDocument,
  Invite,
  InviteDocument,
  Language,
  LanguageDocument,
  Design,
  DesignDocument,
  PasswordReset,
  PasswordResetDocument,
  Project,
  PushToken,
  Register,
  RegisterDocument,
  SkillTypeDocument,
  State,
  StateDocument,
  Style,
  StyleDocument,
  User,
  UserDocument,
  UserSubscription,
  UserSubscriptionDocument,
  Subscription,
  SubscriptionDocument,
  UserSubscriptionStatus,
  UserStorage,
  UserStorageDocument,
} from '@/src/schemas/schemas';
import { DEFAULT_LANGUAGE } from './utils/constants';
import { ExceptionsEnum, InviteStatusEnum, RolesEnum } from './utils/enums';
import {
  alreadyExitsError,
  resourceDuplicatedError,
  resourceNotFoundError,
  skillTypeNotFoundError,
  stylesTypeNotFoundError,
  unauthorizedError,
} from './utils/errors';
import {
  getCollabArtworkFileName,
  mimetypeToFileExtension,
} from './utils/functions';
import { SkillsObjectType, TransportImageType } from './utils/types';
import bcrypt = require('bcryptjs');
import ServiceException from './exceptions/ServiceException';
import { HubspotService } from './services/hubspot.service';
import { CreateWalletAccount } from './dto/wallet/createWalletAccount.dto';
import { AddPushTokenDto } from './dto/addPushToken.dto';
import { RemovePushTokenDto } from './dto/removePushToken.dto';
// import { FeedsService } from './services/feeds.service';
import { CopyInvitesDto } from './dto/invites/copyInvites.dto';
import { AddTicketDto } from './dto/addTicket.dto';
import { CreatePasswordResetDto } from './dto/passwordReset/createPasswordReset.dto';
import { FileStorageService, StorageLimitExceededException } from '../file-storage/fileStorage.service';
import { ProjectsService } from '../projects/projects.service';
import { ChatService } from '../chat/chat.service';
import { ProjectGetterService } from '../projects/services/projectGetter.service';
import { TracksService } from '../tracks/tracks.service';
import { NotifiesService } from '../notifies/notifies.service';
import { KazmService } from '../kazm/kazm.service';
import { CreateMemberDto, TrackEventDto } from '../kazm/dto/kazm.dto';
import { KAZM_EVENT_TYPE } from '../kazm/utils/constants';
import { AyrshareService } from '../ayrshare/ayrshare.service';
import { StorageType } from '../schemas/utils/enums';
import { SubscriptionException } from '../guards/feature-validation.guard';
import { UserActivityService } from '../user-activity/user-activity.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';
import { OtpDto } from './dto/otp.dto';
import { SmsService } from '../notifies/services/sms.service';

const DEFAULT_IMAGE_TRANS_FILE_REDIS_CACHE_TTL = 60;

// import { HttpException, HttpStatus } from '@nestjs/common';

export class CustomHttpException extends HttpException {
  constructor(
    statusCode: HttpStatus,
    errorCode: string,
    message: string,
    additionalData?: Record<string, any>, // Optional additional data
  ) {
    super(
      {
        statusCode,
        errorCode,
        message,
        ...additionalData, // Include additional data if provided
      },
      statusCode,
    );
  }
}

@Injectable()
export class UsersService {
  private configService: ConfigService<Record<string, unknown>, false>;
  constructor(
    // Models
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    @InjectModel(City.name) private cityModel: Model<CityDocument>,
    @InjectModel(Register.name) private registerModel: Model<RegisterDocument>,
    @InjectModel(Subscription.name)
    private subscriptionModel: Model<SubscriptionDocument>,
    @InjectModel(UserSubscription.name)
    private userSubscriptionModel: Model<UserSubscriptionDocument>,

    @InjectModel(Style.name) private styleModel: Model<StyleDocument>,
    @InjectModel('skill_type') private skillModel: Model<SkillTypeDocument>,
    @InjectModel(Collaboration.name)
    private collabModel: Model<CollaborationDocument>,
    @InjectModel(Country.name) private countryModel: Model<CountryDocument>,
    @InjectModel(State.name) private stateModel: Model<StateDocument>,
    @InjectModel(Invite.name) private inviteModel: Model<InviteDocument>,
    @InjectModel(Account.name) private accountModel: Model<AccountDocument>,
    @InjectModel(PasswordReset.name)
    private passwordResetModel: Model<PasswordResetDocument>,
    @InjectModel('languages') private languageModel: Model<LanguageDocument>,
    @InjectModel('design') private designModel: Model<DesignDocument>,
    @InjectModel(UserStorage.name) private userStorageModel: Model<UserStorageDocument>,
    //Services
    @InjectRedis() private readonly redis: Redis,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
    private readonly hubspotService: HubspotService,
    // private readonly feedsService: FeedsService,
    @Inject(forwardRef(() => TracksService))
    private readonly tracksService: TracksService,
    @Inject(ProjectGetterService)
    private readonly projectGetterService: ProjectGetterService,
    @Inject(ProjectsService)
    private readonly projectsService: ProjectsService,
    @Inject(FileStorageService)
    private readonly fileStorageService: FileStorageService,
    @Inject(NotifiesService)
    private readonly notificationService: NotifiesService,
    @Inject(KazmService)
    private readonly kazmService: KazmService,
    private readonly ayrshareService: AyrshareService, // private readonly coinflowService: CoinflowService,
    private readonly userActivityService: UserActivityService,
    private readonly smsService: SmsService,
  ) {
    this.configService = new ConfigService();
  }

  private project = {
    clb_availability_items: 0,
    skills: 0,
    styles: 0,
    city: 0,
    password: 0,
  };

  /**
   * Validate the user by checking the user login
   * @function
   * @param {ValidateUserDto} validateUserDto - Carry an object with email and password for validation.
   * @returns {Promise<Session>} - Returns a "session" that is composed by user informations
   */
  async validate(
    validateUserDto: ValidateUserDto,
  ): Promise<SessionUserDto | null> {
    const { role } = validateUserDto;
    const specifiedRole = !!role;
    const isUserRole = role === RolesEnum.USER || !specifiedRole;
    // If a role was specified, we check if the user has the role
    // If not, use USER as default role and consider user without roles as USER
    const roleCondition: FilterQuery<UserDocument> = isUserRole
      ? {
        $or: [
          {
            roles: {
              $in: [RolesEnum.USER],
            },
          },
          {
            roles: {
              $exists: false,
            },
          },
        ],
      }
      : {
        roles: {
          $in: [role],
        },
      };
    const res = await this.userModel.find(
      {
        // email: validateUserDto.email,
        email: { $regex: new RegExp(`^${validateUserDto.email}$`, 'i') },
        emailVerified: true,
        ...roleCondition,
      }, // Where clause
      {
        _id: 1,
        name: 1,
        email: 1,
        profile_img: 1,
        profile_type: 1,
        password: 1,
        descr: 1,
        roles: 1,
        isBanned: 1,
        loginFlag: 1,
        firstTimeLogin: 1,
      }, // Fields to return
    );

    const myUser = res[0];

    if (!myUser) {
      throw new ServiceException(
        'Invalid credentials, please try again',
        ExceptionsEnum.BadRequest,
      );
      // unauthorizedError('Invalid credentials');
    }

    if (myUser.isBanned) {
      throw new ServiceException(
        'The user has been banned by the admin. Please contact the admin for further assistance.',
        ExceptionsEnum.BadRequest,
      );
    }

    //Compare the pass hashs
    const compareRes = await bcrypt.compare(
      validateUserDto.pass,
      myUser.password,
    );

    //Checks if the compare is false to return null
    if (!compareRes) {
      throw new ServiceException(
        'Invalid credentials, please try again',
        ExceptionsEnum.BadRequest,
      );
      // unauthorizedError('Invalid credentials');
    }

    const sessionUser = {
      id: myUser._id,
      email: myUser.email,
      image: myUser.profile_img,
      name: myUser.name,
      profile_type: myUser.profile_type,
      jwt: null,
      roles: myUser.roles,
    };

    //Sign a JWT if needed
    if (validateUserDto.withJwt) {
      const newJwt = sign(
        {
          name: sessionUser.name,
          email: sessionUser.email,
          image: sessionUser.image,
          id: sessionUser.id.toString(),
          sub: sessionUser.id.toString(),
          roles: sessionUser.roles,
        },
        this.configService.get<string>('SECRET_KEY'),
      );

      sessionUser.jwt = newJwt;
    }

    //firstTimeLogin set false
    if (!myUser.loginFlag) {
      myUser.firstTimeLogin = false;
      await myUser.save();
    }

    myUser.loginFlag = false;
    await myUser.save();

    return sessionUser;
  }

  /**
   * Insert a new user in the database
   * @function
   * @param {CreateUserDto} createUserDto - The object user modeled by a MongoDB schema
   */
  async create(createUserDto: CreateUserDto): Promise<User> {
    // if (process.env.INVITE_ACCOUNT === 'true') {
    //   try {
    //     invitation = await this.inviteModel
    //       .findById(createUserDto.invitationCode)
    //       .where('status')
    //       .ne(InviteStatusEnum.USED);
    //   } catch (error) {
    //     throw new ServiceException(
    //       'Invalid invitation code',
    //       ExceptionsEnum.BadRequest,
    //     );
    //   }

    //   if (!invitation) {
    //     throw new ServiceException(
    //       'Invalid invitation code',
    //       ExceptionsEnum.BadRequest,
    //     );
    //   }

    //   invitation.status = InviteStatusEnum.USED;
    // }

    let userFound = await this.userModel
      .findOne()
      .where('email')
      .equals(createUserDto.email);

    if (userFound && userFound.emailVerified) {
      resourceDuplicatedError('Email');
    }

    const confirmEmailToken = sign(
      {
        name: createUserDto.username,
        email: createUserDto.email,
      },
      this.configService.get<string>('SECRET_KEY'),
    );

    let newPicture = createUserDto.profile_img || null;

    //Check if the image host is already google storage
    const imageHost = createUserDto.profile_img?.substring(
      0,
      this.configService.get<string>('STORAGE_HOST').length,
    );

    if (
      newPicture &&
      imageHost !== this.configService.get<string>('STORAGE_HOST')
    ) {
      const answer_profile_picture =
        await this.fileStorageService.transferImage({
          url: createUserDto.profile_img,
          name: 'profile_image_' + Date.now().toString(),
        });
      if (answer_profile_picture !== 'null') {
        newPicture = answer_profile_picture;
      }
    }

    let encryptedPassword;
    if (createUserDto?.password) {
      encryptedPassword = await this.encryptPassword(createUserDto?.password);
    }

    if (!userFound) {
      const createdUser = new this.userModel({
        ...createUserDto,
        email: createUserDto.email.toLowerCase(),
        profile_img: newPicture,
        birthday: createUserDto.birthday
          ? new Date(createUserDto.birthday)
          : null,
        ...(createUserDto?.password ? { password: encryptedPassword } : {}),
        emailVerified: false,
        confirmEmailToken,
        roles: [RolesEnum.USER],
      });

      const newUser = await createdUser.save();

      // Assign Free Subscription to new user
      await this.assignFreeSubscription(newUser._id);

      // Create users storage doc
      await this.createUserStorageRecord(newUser._id)

      // // Create Ayrshare profile
      // await this.ayrshareService.createProfile(
      //   { title: newUser?.username || newUser?.name },
      //   newUser._id,
      // );

      userFound = newUser;
    } else {
      userFound.username = createUserDto.username;
      userFound.birthday = createUserDto.birthday
        ? new Date(createUserDto.birthday)
        : null;
      userFound.password = await this.encryptPassword(createUserDto.password);
      userFound.emailVerified = false;
      userFound.confirmEmailToken = confirmEmailToken;
      userFound.profile_img = newPicture;
      userFound = await userFound.save();
    }

    await this.linkInvitedProjectsCollaboratorsToUser(userFound);

    let isMobile = false
    if (createUserDto.isMobile) isMobile = true

    await this.notificationService.sendRegisterConfirmation({
      email: userFound.email,
      name: userFound.username,
      token: confirmEmailToken,
      isMobile: isMobile
    });

    // // Create member on Kazm
    // const memberBody: CreateMemberDto = {
    //   accountType: 'EMAIL',
    //   id: userFound.email,
    // };
    // await this.kazmService.createMember(memberBody);
    // // Track event on Kazm
    // const eventBody: TrackEventDto = {
    //   eventType: KAZM_EVENT_TYPE['SETUP_MUSICAL_ACCOUNT'],
    //   connectedAccount: {
    //     id: userFound.email,
    //     accountType: 'EMAIL',
    //   },
    // };
    // await this.kazmService.trackEvent(eventBody);

    // TODO: check that this works
    await this.chatService.createUser({
      id: userFound._id.toString(),
      name: userFound.username,
    });

    let invitation = false;

    //gamification token assign
    if (createUserDto.invitationCode) {
      await this.userActivityService.activity(createUserDto.invitationCode, EventTypeEnum.INVITE_PROJECT_COLLABORATORS)
      invitation = true
    }

    if (invitation) {
      //add notification
      const fromUserId = userFound._id.toString();
      const toUserId = createUserDto.invitationCode.toString();

      await this.notificationService.acceptInvitation(toUserId, fromUserId);
    }

    // invitation && (await invitation.save());

    return userFound;
  }

  /**
   * Link invited users as projects collaborators
   *
   * @param {User} user - The user to link
   * @returns {Promise<void>}
   */
  private async linkInvitedProjectsCollaboratorsToUser(
    user: any,
  ): Promise<any> {
    return this.projectsService.linkInvitedProjectsCollaboratorsToUser({
      userId: user._id,
      email: user.email,
    });
  }

  /**
   * Get project entity details
   *
   * @param {String} project_id
   * @returns {Promise<Project>}
   */
  private getProject(project_id: string, owner): any {
    return this.projectGetterService.getProject({
      projectId: project_id,
      owner,
    });
  }

  async assignFreeSubscription(userId: string) {
    const freeSubscription = await this.subscriptionModel.findOne({
      planCode: 'FREEMUSICAL',
    });

    let userSubscription = await this.userSubscriptionModel.findOne({
      userId,
    });

    const startDate = new Date();
    const endDate = new Date();
    if (freeSubscription.interval === 'Monthly') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (freeSubscription.interval === 'Yearly') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }

    if (!userSubscription) {
      // create userSubscriptionFeatures
      const userSubscriptionFeatures = [];
      if (freeSubscription.features.length) {
        for (let i = 0; i < freeSubscription.features.length; i++) {
          const feature = freeSubscription.features[i];
          if (feature) {
            const userFeature: any = {
              featureKey: feature.featureKey,
              limit: feature.limit,
              unit: feature.unit,
              available: feature.available,
              description: feature.description
            };
            if (feature.limit && feature.limit !== null && feature.limit !== undefined) {
              userFeature.usage = 0
            }
            userSubscriptionFeatures.push(userFeature);
          }
        }
      }

      // Create new subscription
      userSubscription = await this.userSubscriptionModel.create({
        userId,
        subscriptionId: freeSubscription._id,
        name: freeSubscription.name,
        planCode: freeSubscription.planCode,
        startDate,
        endDate,
        subscriptionInterval: freeSubscription.interval,
        type: freeSubscription.type,
        status: UserSubscriptionStatus.Active,
        usage: userSubscriptionFeatures,
      });
    }
    return userSubscription;
  }

  async createUserStorageRecord(userId: string) {
    try {
      const storageDoc = {
        userId: new ObjectId(userId),
        totalStorageUsed: 0,
        storage: [
          {
            storageUsed: 0,
            storageType: StorageType.GC
          },
          {
            storageUsed: 0,
            storageType: StorageType.IPFS
          }
        ]
      }
      return await this.userStorageModel.create(storageDoc)
    } catch (err) {
      throw new Error(err.message)
    }
  }
  /**
   * Sends a email with a reset link to the user.
   *
   * @param {String} email
   * @returns {Promise<PasswordReset>}
   */
  async createPasswordReset({
    email,
  }: CreatePasswordResetDto): Promise<PasswordReset> {
    const user = await this.userModel
      .findOne()
      .where('email')
      .equals(email)
      .where('emailVerified')
      .ne(false);

    if (!user) {
      resourceNotFoundError('Email');
    }

    // Check if exists a not expired token for the user
    const previousReset = await this.passwordResetModel
      .findOne()
      .populate('user')
      .where('user', user._id)
      .gt('expiresAt', Date.now());

    if (previousReset) {
      await this.sendPasswordResetViaEmail(user, previousReset.token);

      return previousReset;
    }

    const token = sign(
      {
        name: user.name,
        email: user.email,
      },
      this.configService.get<string>('SECRET_KEY'),
    );

    const MILLISECONDS_TO_EXPIRE = 24 * 60 * 60 * 1000; // 24 hours
    const expiresAt = Date.now() + MILLISECONDS_TO_EXPIRE;
    const reset = new this.passwordResetModel({
      user: user._id,
      token,
      expiresAt: new Date(expiresAt).getTime(),
    });
    await reset.save();

    await this.sendPasswordResetViaEmail(user, token);

    return reset;
  }

  /**
   * Sends an email to user with a reset link.
   *
   * @param {User} user
   * @param {String} token
   * @returns {Promise<void>}
   */
  private async sendPasswordResetViaEmail(
    user: User,
    token: string,
  ): Promise<void> {
    await this.notificationService.sendResetPassword({
      email: user.email,
      name: user.name,
      token,
    });
  }

  /**
   * Update the user password.
   *
   * @param {ResetPasswordDto} resetPasswordDto
   *
   * @returns {Promise<boolean>}
   */
  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<boolean> {
    try {
      const { token, password } = resetPasswordDto;
      const resetDataWithUser = await this.passwordResetModel
        .findOne()
        .where('token')
        .equals(token);

      if (!resetDataWithUser) {
        resourceNotFoundError('Token');
      }

      const hashedPassword = await this.encryptPassword(password);

      const user = await this.userModel
        .findByIdAndUpdate(resetDataWithUser.user, {
          password: hashedPassword,
          emailVerified: true,
        })
        .exec();

      if (!user) {
        throw Error();
      }

      await this.passwordResetModel.findByIdAndDelete(resetDataWithUser._id);

      return true;
    } catch (err) {
      throw new ServiceException(
        'Error requesting pswrd reset',
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  /**
   * Update user to confirmed if token is valid
   *
   * @function
   * @param {token} token - Token to verify the user
   */
  async confirmAccount(token: string): Promise<void> {
    const user = await this.userModel
      .findOne()
      .where('confirmEmailToken')
      .equals(token);

    if (!user) {
      resourceNotFoundError('Token');
    }

    user.confirmEmailToken = undefined;
    user.emailVerified = true;

    //flag added for login
    user.loginFlag = true
    user.firstTimeLogin = true

    //gamification token assign
    await this.userActivityService.activity(user._id, EventTypeEnum.SET_UP_MUSICAL_ACCOUNT)

    user.save();
  }

  /**
   * Returns all users from the database
   * @function
   */
  async findAll({
    lang,
    skills,
    search,
  }: {
    lang?: string;
    skills?: boolean;
    search?: string;
  }): Promise<User[]> {
    if (skills) {
      delete this.project.skills;
    }

    const result = await this.userModel
      .find(
        search
          ? {
            $or: [
              { email: { $regex: search, $options: 'i' } },
              { name: { $regex: search, $options: 'i' } },
              { username: { $regex: search, $options: 'i' } },
            ],
          }
          : {}
      ).select(this.project)
      .populate({
        path: 'skills',
        populate: { path: 'type', model: 'skill_type' },
      })
      .exec();

    const users = JSON.parse(JSON.stringify(result));

    users.map((user: any) => {
      user.skills?.map((skill: any) => {
        skill.type.title =
          skill.type?.title[lang] == null
            ? skill.type.title[DEFAULT_LANGUAGE]
            : skill.type.title[lang];
        return skill;
      });

      return user;
    });

    return users;
  }

  /**
   * Find a user by the id.
   * @function
   * @param {string} id -- User Mongodb (_id)
   */
  async findOne(id: string, project = this.project): Promise<any> {
    const res = await this.userModel
      .findById(new ObjectId(id))
      .select({ password: 0 })
      .populate({
        path: 'city',
        populate: { path: 'stateId', populate: { path: 'countryId' } },
      })
      .populate({
        path: 'skills',
        populate: { path: 'type', model: 'skill_type' },
      })
      .populate({
        path: 'skills',
        populate: { path: 'level', model: 'skill_level' },
      })
      .populate('styles')
      .populate('preferredStyles')
      .populate('clb_interest')
      .populate('clb_setup')
      .lean()
      .exec();
    return res;
  }

  /**
   * Finds a user by the email.
   * @param {String} email - Email of the user
   * @returns {Promise<User | null>}
   */
  findByEmail(email: string): Promise<User | null> {
    const user = this.userModel
      .findOne({ email })
      .select({
        _id: 1,
        name: 1,
        email: 1,
        profile_img: 1,
        skills: 1,
      })
      .exec();

    return user;
  }

  /**
   * @function
   * Update user information by giving non-null information in the object, if the value is null so the field is left unchanged.
   * @param { UpdateUserDto } updateUserDto -- Object with user fields
   */
  async update(
    id: string,
    { preferredStyles, ...updateUserDto }: UpdateUserDto,
  ): Promise<User> {
    //Check if both change password fields exists
    if (updateUserDto.oldPassword && updateUserDto.newPassword) {
      //Error - passwords are equal
      if (updateUserDto.oldPassword === updateUserDto.newPassword) {
        throw new ServiceException(
          'Passed old and new passwords are equal',
          ExceptionsEnum.UnprocessableEntity,
        );
      }

      //Check if the old password is valid
      const res = await this.userModel.find(
        { _id: id }, // Where clause
        { password: 1 }, // Fields to return
      );

      const myUser = res[0];

      if (!myUser) {
        throw new ServiceException('User not found', ExceptionsEnum.NotFound);
      }

      //Compare the pass hashs
      const compareRes = await bcrypt.compare(
        updateUserDto.oldPassword,
        myUser.password,
      );

      //Checks if the compare is false to return null
      if (!compareRes) {
        throw new ServiceException(
          'Wrong password',
          ExceptionsEnum.Unauthorized,
        );
      }

      //Hash password
      updateUserDto.password = await this.encryptPassword(
        updateUserDto.newPassword,
      );

      updateUserDto.emailVerified = true;
      delete updateUserDto.oldPassword;
      delete updateUserDto.newPassword;
    } else {
      //Remove password infos in the objet if exist
      delete updateUserDto.password;
      delete updateUserDto.oldPassword;
      delete updateUserDto.newPassword;
    }

    const styles = [...new Set(preferredStyles)];
    await Promise.all(
      styles.map(async (style) => {
        if (
          (await this.styleModel.findById(new ObjectId(style?.toString()))) ===
          null
        ) {
          throw new ServiceException(
            'Style id do not exists',
            ExceptionsEnum.InternalServerError,
          );
        }
      }),
    );

    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        id,
        {
          ...updateUserDto,
          preferredStyles: styles.map((x) => new ObjectId(x)),
        },
        { new: true },
      )
      .exec();

    // // check for description, photo, instruments (skills and styles)
    // // Kazm fill out profile event trigger
    // if (
    //   updatedUser.descr &&
    //   updatedUser.profile_img &&
    //   updatedUser.skills.length > 0 &&
    //   updatedUser.styles.length > 0
    // ) {
    //   if (updatedUser?.email) {
    //     const eventBody = {
    //       eventType: KAZM_EVENT_TYPE['FILL_OUT_PROFILE'],
    //       connectedAccount: {
    //         id: updatedUser.email,
    //         accountType: 'EMAIL',
    //       },
    //     };
    //     await this.kazmService.trackEvent(eventBody);
    //   }
    // }


    //gamification token assign
    if (updatedUser.descr && updatedUser.city && updatedUser.profile_img && updatedUser.skills.length > 0 && updatedUser.preferredStyles.length > 0) {
      await this.userActivityService.activity(updatedUser._id, EventTypeEnum.FILL_OUT_PROFILE)
    }

    return updatedUser;
  }
  /**
   * @function
   * Delete account and all informations about this user
   * @param {string} userId - User id that will be deleted
   */
  async deleteAccount(userId: string): Promise<any> {
    const collabs = await this.collabModel.find({ userId });

    const promises = collabs.map(async (collab: any) => {
      return await this.deleteCollab(collab._id.toString());
    });

    await Promise.all(promises);
    await this.collabModel.deleteMany({ userId });
    await this.inviteModel.deleteMany({ user: userId });

    const deletedUser = await this.userModel.findOneAndDelete({ _id: userId });

    await this.accountModel.deleteMany({ userId: userId });

    return { message: `User ${deletedUser.name} has been deleted!!` };
  }

  /**
   * @function
   * Update user profile image
   * @param {object} updateImageDto -- Object with user fields
   */
  async updateProfileImage(updateImageDto: UpdateImageDto): Promise<User> {
    //Send message to create file on bucket
    let uploadResult: string;

    try {
      uploadResult = await this.fileStorageService.uploadImage(null, {
        id: updateImageDto.id + '_profile',
        fileCacheKey: updateImageDto.file.fileCacheKey,
        mimetype: updateImageDto.file.mimetype,
        size: updateImageDto.file.size,
        // isPublic means it goes in the public storage bucket - not that it belongs to a public project
        isPublic: true,
      },
        {}
      );
    } catch (error) {
      uploadResult = error;
    }

    //Uploaded with success
    if (uploadResult.substr(0, 6) == 'https:') {
      const newUrl = uploadResult;
      const newProfile = this.userModel.findByIdAndUpdate(
        updateImageDto.id,
        { profile_img: newUrl },
        { new: true },
      );

      await this.chatService.updateUser({
        id: updateImageDto.id,
        profile_img: newUrl,
      });

      //gamification token assign
      const updatedUser = await this.userModel.findOne({ _id: updateImageDto.id })
      console.log(updatedUser, '===updatedUser======');

      if (updatedUser && updatedUser.descr && updatedUser.city && updatedUser.profile_img && updatedUser.skills.length > 0 && updatedUser.preferredStyles.length > 0) {
        await this.userActivityService.activity(updatedUser._id, EventTypeEnum.FILL_OUT_PROFILE)
      }

      return newProfile;
    }
    //Error uploading image
    else {
      throw new ServiceException(
        'Error uploading file',
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  async deleteProfileImage(userId: string) {
    let user = await this.userModel.findById(userId);

    if (user.profile_img !== null && typeof user.profile_img !== 'string') {
      // let result = this.getBucketAndImageName(user.profile_img);
      let result = userId + '_profile'
      let res = await this.fileStorageService.deleteImageFromPublicBucket(
        null,
        result,
      );
    }
    user.profile_img = null;
    await user.save();
    return 'File Remove Successfully.';
  }

  async getBucketAndImageName(url: string) {
    const match = url.match(/https:\/\/storage\.googleapis\.com\/(.*)\/(.*)/);

    if (match && match[1] && match[2]) {
      const bucketName = match[1];
      const imageName = match[2];

      return { bucketName, imageName };
    }

    throw new Error('Invalid Google Cloud Storage URL');
  }

  /**
   * @function
   * Update user cover image
   * @param {object} updateImageDto -- Object with user fields
   */
  async updateCoverImage(updateImageDto: UpdateImageDto): Promise<User> {
    //Send message to create file on bucket
    let uploadResult: string;

    try {
      uploadResult = await this.fileStorageService.uploadImage(null, {
        id: updateImageDto.id + '_cover',
        fileCacheKey: updateImageDto.file.fileCacheKey,
        mimetype: updateImageDto.file.mimetype,
        size: updateImageDto.file.size,
        // isPublic means it goes in the public storage bucket - not that it belongs to a public project
        isPublic: true,
      },
        {}
      );
    } catch (error) {
      uploadResult = error;
    }

    //Uploaded with success
    if (uploadResult.substr(0, 6) == 'https:') {
      const newUrl = uploadResult;

      return this.userModel
        .findByIdAndUpdate(
          updateImageDto.id,
          { cover_img: newUrl },
          { new: true },
        )
        .exec();
    }
    //Error uploading image
    else {
      throw new ServiceException(
        'Error uploading file',
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  /**
   *Add a new skill for the user, a skill is constituted by an id of a typing skill and a level skill, see type_skills
   and levels_skills schemas on database
   * @function
   * @param {string} id -- Id of user
   * @param {addSkill} skill -- Object linked with an id of type and level skill
   */
  async addSkill({ id, skill }: { id: string; skill: AddSkillDto }) {
    const user = await this.userModel.findById(new ObjectId(id?.toString()));

    if (user == null) {
      throw new ServiceException('User do not found', ExceptionsEnum.NotFound);
    }

    const objectId = new ObjectId(skill.type);
    const findDuplicated = user.skills.some(({ type }) => {
      return objectId.equals(type as unknown as ObjectId);
    });

    if (findDuplicated) {
      throw new ServiceException(
        'Duplicated id of skill level',
        ExceptionsEnum.Conflict,
      );
    }

    user.skills = [
      ...user.skills,
      {
        type: new ObjectId(skill.type) as any, // mongoose.Schema.Types.ObjectId
        level: new ObjectId(skill.level) as any, // mongoose.Schema.Types.ObjectId
      },
    ];

    await user.save();
    return skill;
  }

  /**
   *Remove a skill of the user
   * @function
   * @param {string} id -- Id of user
   * @param {string} id -- The skill type id
   */
  async removeSkill({ id, skill_type }: { id: string; skill_type: string }) {
    const user = await this.userModel.findById(new ObjectId(id?.toString()));

    if (user == null) {
      throw new ServiceException('User do not found', ExceptionsEnum.NotFound);
    }

    user.skills = user.skills.filter(({ type }) => {
      return (type as any).toString() != skill_type;
    });

    await user.save();
    return skill_type;
  }

  /**
   * Get all skills of some user
   * @function
   * @param {string} id -- Id of user
   * @param {string | null} lang -- The language that information will be formatted, if the language is null then the information will come in English.
   */
  async getUserSkills({ id, lang }: { id: string; lang: string | null }) {
    const user_search = await this.userModel.aggregate([
      {
        $match: {
          _id: new ObjectId(id),
        },
      },
      { $project: { _id: 0, skills: 1 } },
      {
        $unwind: '$skills',
      },
      {
        $lookup: {
          from: 'skill_types',
          localField: 'skills.type',
          foreignField: '_id',
          as: 'skills_type_info',
        },
      },
      {
        $lookup: {
          from: 'skill_levels',
          localField: 'skills.level',
          foreignField: '_id',
          as: 'skills_level_info',
        },
      },
    ]);

    if (user_search.length < 1) {
      return [];
    }

    const user = user_search as SkillsObjectType[];

    return user.map((value) => ({
      level: {
        _id: value.skills_level_info[0]._id,
        identifier: value.skills_level_info[0].level,
        title:
          value.skills_level_info[0].title[lang] == null
            ? value.skills_level_info[0].title[DEFAULT_LANGUAGE]
            : value.skills_level_info[0].title[lang],
      },
      type: {
        _id: value.skills_type_info[0]._id,
        identifier: value.skills_type_info[0].type,
        title:
          value.skills_type_info[0].title[lang] == null
            ? value.skills_type_info[0].title[DEFAULT_LANGUAGE]
            : value.skills_type_info[0].title[lang],
      },
    }));
  }

  async addStyle({
    id,
    addStyleDto,
  }: {
    id: string;
    addStyleDto: AddStyleDto;
  }) {
    const user = await this.userModel.findById(new ObjectId(id?.toString()));

    if (user == null) {
      throw new ServiceException('User do not found', ExceptionsEnum.NotFound);
    }

    const objectId = new ObjectId(addStyleDto.styleId);

    const findDuplicated = user.styles.some((styleId) => {
      return objectId.equals(styleId as unknown as ObjectId);
    });

    if (findDuplicated) {
      throw new ServiceException(
        'User already has this style',
        ExceptionsEnum.Conflict,
      );
    }

    user.styles = [...user.styles, objectId as any];

    await user.save();

    return addStyleDto;
  }

  async removeStyle({ id, styleId }: { id: string; styleId: string }) {
    const user = await this.userModel.findById(new ObjectId(id?.toString()));

    if (user == null) {
      throw new ServiceException('User do not found', ExceptionsEnum.NotFound);
    }

    user.styles = user.styles.filter((id) => {
      return (id as any).toString() != styleId;
    });

    await user.save();

    return user;
  }

  async getUserStyles({ id, lang }: { id: string; lang: string }) {
    const user = await this.userModel
      .findById(new ObjectId(id?.toString()))
      .populate('styles');

    return user.styles.map((style) =>
      style.title[lang] ? style.title[lang] : style.title[DEFAULT_LANGUAGE],
    );
  }

  /**
   * Create availability informations on profile user
   * @param {string} id User id where availability will be inserted
   * @param {CreateCollabDto} item Informations who will be inserted
   * @returns {User} New collaboration object
   */
  async createCollabAvailability({
    id,
    data,
  }: {
    id: string;
    data: CreateCollabItemDto;
  }): Promise<User> {
    const object = await this.userModel.findById(new ObjectId(id?.toString()));
    const findOrder = object.clb_availability_items.find(
      ({ order }) => order == data.order,
    );

    if (findOrder) {
      throw new ServiceException(
        'Duplicated order identification',
        ExceptionsEnum.Conflict,
      );
    }

    object.clb_availability_items = [...object.clb_availability_items, data];
    await object.save();

    // await this.feedsService.createdCollaborationOpportunity(
    //   new ObjectId(object._id),
    //   id,
    // );

    return object;
  }

  /**
   * Get all Collaborations Availability
   * @param id User id
   * @returns Collaborations Availability
   */
  async findCollabAvailability(id: string) {
    const object = await this.userModel.findById(new ObjectId(id?.toString()));
    return object.clb_availability_items;
  }

  /**
   * Update availability informaitons on profile user
   * @param id User id where availability will be updated
   * @param items Informations who will be updated
   * @returns User who has been updated
   */
  async updateCollabAvailability({
    id,
    items,
  }: {
    id: string;
    items: UpdateCollabItemDto[];
  }) {
    const object = await this.userModel.findById(new ObjectId(id?.toString()));
    object.clb_availability_items = items;
    await object.save();
    return object;
  }

  /**
   * Creates a project from collaboration
   * @param {String} id Collaboration ID
   */
  async createProjectFromCollaboration(id: string) {
    const collab = await this.findCollabById(id);

    if (!collab) {
      resourceNotFoundError('Collaboration');
    }

    const { artworkUrl, artworkExtension } = collab;

    const projectData = {
      user: collab.userId,
      name: collab.title,
      splitModel: 'EQUAL_SPLIT',
      split: 100,
      type: 'SINGLE',
      collaborators: [],
      file: null,
      artworkExension: artworkExtension,
      ownerRoles: [],
    };

    if (artworkUrl) {
      const fileCacheKey = `${collab.title.trim().replace(/\s/g, '')}_image_${collab.userId
        }_${Date.now()}`;

      const transferImageObj = await this.copyImageToCache(
        artworkUrl,
        fileCacheKey,
      );

      projectData.file = transferImageObj;
    }

    const project = (await this.projectsService.create(
      projectData,
    )) as Project & { _id?: string | ObjectId };

    const projectUser = project.user as User & { _id: ObjectId };

    await this.tracksService.linkToProject({
      owner: projectUser._id?.toString(),
      trackIds: [collab.track.toString()],
      projectId: project._id.toString(),
    });

    await this.collabModel.deleteOne({ _id: id });

    return project;
  }

  /**
   * Copies a image from an URL to redis cache.
   *
   * @param {String} imageUrl Image url
   * @param {String} fileCacheKey
   * @returns {Promise<TransportImageType>}
   */
  async copyImageToCache(
    imageUrl: string,
    fileCacheKey: string,
  ): Promise<TransportImageType> {
    const blob: any = await fetch(imageUrl).then((r: any) => r.blob());

    const fileBuffer = Buffer.from(await blob.arrayBuffer());

    await this.redis.setBuffer(
      fileCacheKey,
      fileBuffer,
      'EX',
      DEFAULT_IMAGE_TRANS_FILE_REDIS_CACHE_TTL,
    );

    const transferImageObj: TransportImageType = {
      fileCacheKey,
      mimetype: blob.type,
      size: blob.size,
    };

    return transferImageObj;
  }

  /**
   * Create a new collaboration for a user
   * @param id User id who owns collaboration
   * @param createCollabDto Object that contains the information to create them
   * @returns The new Collaboration object
   */
  async createCollab({
    id,
    createCollabDto,
  }: {
    id: string;
    createCollabDto: CreateCollabDto;
  }) {
    const user = await this.userModel.findById(new ObjectId(id?.toString()));
    if (!user) {
      resourceNotFoundError('User');
    }

    // remove duplicated skills
    const uniqueSeeking = [...new Set(createCollabDto.seeking)];
    const uniqueSkillsOffered = [...new Set(createCollabDto.skillsOffered)];
    const uniqueStyles = [...new Set(createCollabDto.styles)];

    const uniqueSkills = [
      ...new Set([...uniqueSeeking, ...uniqueSkillsOffered]),
    ];

    const skills = await this.skillModel.find({
      _id: { $in: uniqueSkills },
    });

    const styles = await this.styleModel.find({
      _id: { $in: uniqueStyles },
    });

    // verifiy if all skills exist on the base
    if (skills.length !== uniqueSkills.length) {
      skillTypeNotFoundError();
    }

    if (styles.length !== uniqueStyles.length) {
      stylesTypeNotFoundError();
    }

    let newCollab: Document<any, any, CollaborationDocument> &
      Collaboration &
      Document & { _id: MongooseTypes.ObjectId } = undefined;

    const project = await lastValueFrom(
      this.getProject(createCollabDto.projectId, id),
    );

    if (!project) {
      resourceNotFoundError('Project');
    }

    newCollab = new this.collabModel({
      userId: user._id,
      projectId: createCollabDto.projectId,
      ...createCollabDto,
      seeking: uniqueSeeking,
      skillsOffered: uniqueSkillsOffered,
      styles: uniqueStyles,
    });

    if (createCollabDto.artwork) {
      newCollab.artworkExtension = mimetypeToFileExtension(
        createCollabDto.artwork.mimetype,
      );
    }

    await newCollab.save();

    if (createCollabDto.artwork) {
      const uploadResult = await this.uploadImage(
        user._id,
        getCollabArtworkFileName(newCollab._id.toString()),
        createCollabDto.artwork,
        true,
        newCollab._id
      );

      // If an error ocurred, try to remove the document and throw an error
      if (!uploadResult) {
        await this.collabModel.deleteOne({
          userId: newCollab.userId,
          _id: newCollab._id,
        });

        throw new ServiceException(
          'Error uploading file',
          ExceptionsEnum.BadRequest,
        );
      }
    }

    const projectId = createCollabDto.projectId.toString();
    const authorId = user._id.toString();

    await this.notificationService.collaboratorOpp(
      projectId,
      authorId,
      uniqueStyles,
    );

    return newCollab;
  }

  /**
   * Get all user collaborations from the base
   * @param userId User id who will get all the collaborations
   * @returns Collaborations List
   */
  async findAllCollab({
    userId,
    filters,
    txtFilter,
    projectId,
    offSet,
  }: {
    userId?: string | null;
    offSet?: number;
    filters?: {
      styles?: string[];
      seeking?: string[];
      skillsOffered?: string[];
    };
    txtFilter?: string;
    projectId?: string | null;
    lang?: string;
  }) {
    // TODO: fix this heap of nonesense.
    const queryFilters = Object.entries(filters).reduce(
      (pred, [filterType, value]) => ({
        ...pred,
        ...(value
          ? {
            [filterType]: {
              $in: value.map((x) => new ObjectId(x)),
            },
          }
          : {}),
        ...(txtFilter && txtFilter.length > 0
          ? { title: { $regex: new RegExp('^' + txtFilter), $options: 'i' } }
          : {}),
      }),
      {},
    );

    const result = await this.collabModel.aggregate([
      {
        $match: {
          ...(userId != null ? { userId: new ObjectId(userId) } : {}),
          ...(projectId != null ? { projectId: new ObjectId(projectId) } : {}),
          ...queryFilters,
          isDeleted: { $ne: true },
        },
      },
      {
        $lookup: {
          from: 'tracks',
          localField: 'track',
          foreignField: '_id',
          as: 'track',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $lookup: {
          from: 'projects',
          localField: 'projectId',
          foreignField: '_id',
          as: 'project',
        },
      },
      {
        $lookup: {
          from: 'applications',
          localField: 'projectId',
          foreignField: 'projectId',
          as: 'applications',
        },
      },
      {
        $unwind: {
          path: '$track',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$project',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$user',
        },
      },
      { $sort: { updatedAt: -1 } },
      {
        $project: {
          'user.password': 0,
        },
      },
      ...(offSet != null ? [{ $limit: offSet * 20 + 20 }] : []),
      ...(offSet != null ? [{ $skip: offSet * 20 }] : []),
    ]);

    let collabs = JSON.parse(JSON.stringify(result));

    const promises = collabs.map(async (collab: any) => {
      if (collab.artworkUrl) {
        return collab;
      }

      const fileName = `${collab._id.toString()}_collab_artwork.${collab.artworkExtension
        }`;

      const artworkUrl = await this.getImageUrl(fileName);

      if (artworkUrl) {
        collab.artworkUrl = artworkUrl;
      }

      return collab;
    });

    collabs = await Promise.all(promises);
    return collabs;
  }

  /**
   * Finds a collaboration by its ID
   * @param {ObjectId|String} id Collab ID
   * @returns {Promise<Collaboration>}
   */
  async findCollabById(id: ObjectId | string): Promise<Collaboration> {
    const collab = await this.collabModel.findById(
      new ObjectId(id?.toString()),
    );

    if (collab) {
      if (!collab.artworkExtension) {
        return collab;
      }

      const fileName = `${collab._id.toString()}_collab_artwork.${collab.artworkExtension
        }`;

      const artworkUrl = await this.getImageUrl(fileName);

      if (artworkUrl) {
        collab.artworkUrl = artworkUrl;
      }
    }

    return collab;
  }

  /**
   * Update Collaboration with new informations
   * @param collabId  Collaboration Id that will updated
   * @param updateCollabDto Informations that will updated
   * @returns Collaboration updated
   */
  async updateCollab({
    collabId,
    updateCollabDto,
  }: {
    collabId: string;
    updateCollabDto: UpdateCollabDto;
    owner: string;
  }) {
    const collab = await this.collabModel.findById(
      new ObjectId(collabId?.toString()),
    );

    if (!collab) {
      resourceNotFoundError('Collaboration');
    }

    // remove duplicated skills
    const uniqueSeeking = [...new Set(updateCollabDto.seeking)];
    const uniqueSkillsOffered = [...new Set(updateCollabDto.skillsOffered)];
    const uniqueSkills = [
      ...new Set([...uniqueSeeking, ...uniqueSkillsOffered]),
    ];

    const skills = await this.skillModel.find({
      _id: { $in: uniqueSkills },
    });

    // verifiy if all skills exist on the base
    if (skills.length !== uniqueSkills.length) {
      skillTypeNotFoundError();
    }

    const { mimetype, fileCacheKey } = updateCollabDto?.artwork || {};

    if (fileCacheKey && mimetype) {
      updateCollabDto.artworkExtension = mimetypeToFileExtension(
        updateCollabDto.artwork.mimetype,
      );

      const uploadResult = await this.uploadImage(
        collab.userId,
        `${collab._id.toString()}_collab_artwork`,
        updateCollabDto.artwork,
        true,
        collab._id.toString()
      );

      // If an error ocurred, throw an error
      if (!uploadResult) {
        throw new ServiceException(
          'Error uploading file',
          ExceptionsEnum.InternalServerError,
        );
      }
    }

    await this.collabModel.updateOne({ _id: collabId }, { ...updateCollabDto });

    return await this.collabModel.findById(new ObjectId(collabId?.toString()));
  }

  /**
   * Delete Collaboration from base
   * @param collabId Collaboration id that will be deleted
   * @returns Deleted Collaboration
   */
  async deleteCollab(collabId: string) {
    const collabFound = await this.collabModel.findByIdAndDelete(collabId);

    if (collabFound?.artworkExtension) {
      await this.fileStorageService.deleteImage(collabFound.userId, {
        name: getCollabArtworkFileName(
          collabFound._id.toString(),
          collabFound.artworkExtension,
        ),
      });
    }

    return collabFound;
  }

  /**
   * Update user's profile with new city localization
   * @param id User id that will be updated
   * @param cityId City id that will be added
   * @returns User object with new city information
   */
  async addLocalization({ id, cityId }: { id: string; cityId: string }) {
    const user = await this.userModel.findById(new ObjectId(id?.toString()));

    if (!user) {
      throw new ServiceException('User do not found', ExceptionsEnum.NotFound);
    }

    const city = await this.cityModel.findById(
      new ObjectId(cityId?.toString()),
    );

    if (!city) {
      throw new ServiceException(
        'City not found',
        ExceptionsEnum.UnprocessableEntity,
      );
    }

    user.city = cityId;

    await user.save();

    //gamification token assign
    if (user.descr && user.city && user.profile_img && user.skills.length > 0 && user.preferredStyles.length > 0) {
      await this.userActivityService.activity(user._id, EventTypeEnum.FILL_OUT_PROFILE)
    }

    return this.findOne(id);
  }

  /**
   * Get localization of user
   * @param id User id
   * @param lang Language to show country
   * @returns Localization object
   */
  async getLocalization(
    id: string,
    lang = 'english',
  ): Promise<{
    city: CityDocument;
    state: StateDocument;
    country: CountryDocument;
  }> {
    const user = await this.userModel
      .findById(new ObjectId(id?.toString()))
      .populate({
        path: 'city',
        select: 'name',
        populate: {
          path: 'stateId',
          select: 'name',
          populate: { path: 'countryId' },
        },
      });

    const city = user.city as CityDocument;

    if (city == null) {
      return null;
    }

    const state = city.stateId as StateDocument;
    const country = state.countryId as CountryDocument;
    country.name = country.name[lang];

    return {
      city,
      state,
      country,
    };
  }

  /**
   * List all countries
   * @returns Country list
   */
  async getCountries(): Promise<Country[]> {
    const countries = await this.countryModel.find().sort({ name: 1 });
    return countries;
  }

  /**
   * List all States
   * @returns State list
   */
  async getStates(countryId: string): Promise<State[]> {
    const states = await this.stateModel.find({ countryId }).sort({ name: 1 });
    return states;
  }

  /**
   * List all Cities
   * @returns City list
   */
  async getCities(stateId: string): Promise<City[]> {
    const cities = await this.cityModel.find({ stateId }).sort({ name: 1 });
    return cities;
  }

  /**
   * Get all invites of a user
   * @param userId User id owner invites
   * @returns
   */
  async getInvitesByUser(userId: string): Promise<Invite[]> {
    const selectFields = '-__v -createdAt -updatedAt';

    const invites = await this.inviteModel
      .find()
      .where('user')
      .equals(userId)
      .select(selectFields);

    if (invites.length) {
      return invites;
    }

    // Create 3 default invites
    for (let i = 0; i < 10; i++) {
      await new this.inviteModel({
        status: InviteStatusEnum.AVAILABLE,
        user: userId,
      }).save();
    }

    return this.inviteModel
      .find()
      .where('user')
      .equals(userId)
      .select(selectFields);
  }

  /**
   * Validate if invite id is valid and update them to used
   * @param inviteId User id owner invites
   * @returns
   */
  async validateInvite({
    id,
    inviteId,
  }: {
    id: string;
    inviteId: string;
  }): Promise<void> {
    const user = await this.userModel.findById(new ObjectId(id?.toString()));

    if (user.invited !== 'false') {
      throw new ServiceException(
        'User is not invited',
        ExceptionsEnum.Forbidden,
      );
    }

    try {
      const invite = await this.inviteModel
        .findByIdAndUpdate(inviteId, {
          status: InviteStatusEnum.USED,
        })
        .where('status')
        .ne(InviteStatusEnum.USED);

      if (!invite) {
        resourceNotFoundError('Invite');
      }

      user.invited = 'true';
      await user.save();

      // this.feedsService.invitedUserJoined(
      //   new ObjectId(invite.user.toString()),
      //   user._id.toString(),
      // );

      return;
    } catch (error) {
      resourceNotFoundError('Invite');
    }
  }

  /**
   * Create invites to user
   * @param {string} userId User id owner invites
   * @param {number} quantity Quantity of invites to create
   * @returns
   */
  async createInvites({
    userId,
    quantity,
  }: {
    userId: string;
    quantity: number;
  }): Promise<any> {
    const user = await this.userModel.findById(
      new ObjectId(userId?.toString()),
    );

    if (!user) {
      resourceNotFoundError('User');
    }

    let index = 0;

    while (index < quantity) {
      await new this.inviteModel({
        status: InviteStatusEnum.AVAILABLE,
        user: user._id,
      }).save();

      index++;
    }

    return { message: `Was created ${quantity} invites to ${user.name}` };
  }

  /**
   * Send invite to an email
   * @param payload Informations to send invite
   * @returns null
   */
  async sendInvites(payload: {
    id: string;
    inviteId: string;
    email: string;
  }): Promise<Invite> {
    const { id, inviteId } = payload;

    const user = await this.userModel.findById(new ObjectId(id?.toString()));

    const invite = await this.inviteModel.findById(
      new ObjectId(inviteId?.toString()),
    );

    if (user._id.toString() !== invite.user.toString()) {
      throw new ServiceException(
        "You can't send invite to other user",
        ExceptionsEnum.Forbidden,
      );
    }

    if (invite.status === 'USED') {
      throw new ServiceException(
        'Invite is already used',
        ExceptionsEnum.Conflict,
      );
    }

    await this.notificationService.sendInvitesUser({
      email: payload.email,
      name: user.name,
      inviteCode: invite._id.toString(),
    });

    try {
      const invite = await this.inviteModel
        .findByIdAndUpdate(inviteId, {
          status: InviteStatusEnum.SEND,
        })
        .where('status')
        .ne(InviteStatusEnum.USED);

      if (!invite) {
        resourceNotFoundError('Invite');
      }

      return invite;
    } catch (error) {
      resourceNotFoundError('Invite');
    }
  }

  /**
   * Copy invite to an email
   * @param {any} data Informations to copy invite
   * @returns null
   */
  async copyInvites({ id }: CopyInvitesDto): Promise<Invite> {
    const invite = await this.inviteModel
      .findByIdAndUpdate(id, {
        status: InviteStatusEnum.COPY,
      })
      .where('status')
      .ne(InviteStatusEnum.USED);

    if (!invite) {
      resourceNotFoundError('Invite');
    }

    invite.set({ status: 'COPY' });

    return invite;
  }

  async createSubscription(payload: createRegisterDto) {
    const inserted = await this.registerModel.findOne({
      email: payload.email,
    });

    if (inserted) {
      return { success: false, msg: 'Email already registered' };
    }

    await new this.registerModel(payload).save();

    try {
      await this.hubspotService.insertContact(payload);
    } catch (e) {
      console.log(e);
    }

    return { success: true, msg: 'Email registered with success' };
  }

  async createTicket(payload: AddTicketDto) {
    try {
      await this.hubspotService.insertTicket(payload);
    } catch (e) {
      console.log(e);
    }

    return { success: true, msg: 'Contact sent with success' };
  }

  async addPushToken(pushTokenDto: AddPushTokenDto) {
    const user = await this.userModel.findById(
      new ObjectId(pushTokenDto.userId?.toString()),
    );

    if (!user) {
      resourceNotFoundError('User');
    }

    const existingToken = user.pushTokens?.find(
      (pt) => pt.token === pushTokenDto.token,
    );
    if (!existingToken) {
      const newPushToken: PushToken = {
        token: pushTokenDto.token,
        _id: new MongooseTypes.ObjectId(),
        createdAt: new Date(),
      };

      user.pushTokens = user.pushTokens
        ? [...user.pushTokens, newPushToken]
        : [newPushToken];
    }
    await user.save();
  }

  async removePushToken(pushTokenDto: RemovePushTokenDto) {
    const user = await this.userModel.findById(
      new ObjectId(pushTokenDto.userId?.toString()),
    );

    if (!user) {
      resourceNotFoundError('User');
    }

    const newPushToken: PushToken = {
      token: pushTokenDto.token,
      _id: new MongooseTypes.ObjectId(),
      createdAt: new Date(),
    };

    user.pushTokens = user.pushTokens
      ? user.pushTokens.filter(
        (pushToken) => pushToken.token !== newPushToken.token,
      )
      : [];

    await user.save();
  }

  /**
   * Searches for file by its filename on the storage.
   *
   * @param {string} fileName Name of the file on storage service
   * @returns {Promise}
   */
  private async getImageUrl(fileName: string): Promise<string | null> {
    let fileUrl: string | null = null;

    try {
      const resultArray = await this.fileStorageService.getImageUrl({
        name: fileName,
      });

      if (resultArray[0]) {
        fileUrl = resultArray[0];
      }
    } catch (error) {
      fileUrl = null;
    }

    return fileUrl;
  }

  /**
   * Uploads an image to the storage service.
   *
   * @param {string} fileName The name of the file on storage service
   * @param {TransportImageType} file File to be uploaded
   * @returns {boolean}
   */
  private async uploadImage(
    userId: string,
    fileName: string,
    file: TransportImageType,
    isPublic: boolean,
    collabId: string
  ): Promise<boolean> {
    try {
      const result = await this.fileStorageService.uploadImage(userId, {
        id: fileName,
        fileCacheKey: file.fileCacheKey,
        mimetype: file.mimetype,
        size: file.size,
        isPublic,
      },
        {
          key: fileName,
          file: 'artwork',
          fileFor: 'collab',
          collab_id: collabId,
          newFile: true
        });

      return !!result;
    } catch (error) {
      return false;
    }
  }

  /**
   * Encrypts a password.
   *
   * @param {String} password
   * @returns {String}
   */
  private encryptPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Create wallet account association
   * @param {CreateWalletAccount} params
   * @returns {User} User updated
   */
  async createWalletAccount(params: CreateWalletAccount): Promise<User> {
    const userFound = await this.userModel.findById(
      new ObjectId(params.owner?.toString()),
    );

    if (!userFound) {
      resourceNotFoundError('User');
    }

    if (
      userFound.wallets.length &&
      userFound.wallets[0]?.addr.toLowerCase() !== params.addr.toLowerCase()
    ) {
      alreadyExitsError('wallet');
    }

    if (!userFound.wallets.some((wallet) => wallet.addr === params.addr)) {
      userFound.wallets.push({ addr: params.addr.toLowerCase(), provider: params.provider });
      userFound.save();
    }

    // // Kazm event trigger for connect wallet
    // // What if user do not have any email added yet
    // if (userFound.email) {
    //   const eventBody = {
    //     eventType: KAZM_EVENT_TYPE['CONNECT_WALLET'],
    //     connectedAccount: {
    //       id: userFound.email,
    //       accountType: 'EMAIL',
    //     },
    //   };
    //   await this.kazmService.trackEvent(eventBody);
    // }

    //gamification token assign
    await this.userActivityService.activity(userFound._id, EventTypeEnum.CONNECT_WALLET)

    return userFound;
  }

  /**
   * Get All Languages
   * @returns {Language[]} List of languages
   */
  async GetLanguages(): Promise<Language[]> {
    try {
      const languages = await this.languageModel.find().exec();
      console.log('languages....', languages);
      return languages;
    } catch (e) {
      console.log('error...', e);
    }
  }

  /**
   * Get All Designs
   * @returns {Design[]} List of Designs
   */
  async GetDesigns(): Promise<Design[]> {
    try {
      const designs = await this.designModel.find().exec();
      return designs;
    } catch (e) {
      console.log('error...', e);
    }
  }

  async GetUserSubscriptions(id: string) {
    try {
      const userSubscriptions = await this.userSubscriptionModel.aggregate([
        {
          $match: {
            userId: new ObjectId(id),
            status: UserSubscriptionStatus.Active,
          },
        },
        {
          $lookup: {
            from: 'subscriptions', // Name of the Subscription collection
            localField: 'subscriptionId', // Field in UserSubscription schema
            foreignField: '_id', // Field in Subscription schema
            as: 'subscriptionDetails', // Output array field
          },
        },
        {
          $unwind: {
            path: '$subscriptionDetails',
            preserveNullAndEmptyArrays: true,
          },
        }, // Flatten subscriptionDetails
      ]);

      return userSubscriptions; // Return the enriched subscription data
    } catch (error) {
      throw new ServiceException(
        'Error fetching user subscriptions: ' + JSON.stringify(error),
        ExceptionsEnum.InternalServerError,
      );
    }
  }

  // async InviteUser(): Promise<Design[]> {
  //   try {
  //     const designs = await this.designModel.find().exec();
  //     return designs;
  //   } catch (e) {
  //     console.log('error...', e);
  //   }
  // }

  /**
   * @function
   * Check username exist or not
   **/
  async checkUsername(username?: string, id?: string): Promise<any> {
    let existingUsername: any;
    if (id && username) {
      existingUsername = await this.userModel.findOne({
        username: username,
        _id: { $ne: id },
      });
    } else {
      existingUsername = await this.userModel.findOne({ username: username });
    }
    return existingUsername;
  }

  //Check username exist or not
  async checkWallet(wallet: string, id: string): Promise<any> {
    const existingWallet = await this.userModel.findOne({
      wallets: { $elemMatch: { addr: wallet } },
      _id: { $ne: id },
    });
    return existingWallet;
  }

  async getUserStorageLimits(userId: string) {
    // Fetch the user's storage document to get the current total storage usage
    const userStorage = await this.userStorageModel.findOne({ userId: new ObjectId(userId) });
    if (!userStorage) {
      throw new ServiceException('User storage record not found', ExceptionsEnum.NotFound);
    }

    const totalUsage = userStorage.totalStorageUsed || 0;

    // Fetch the user's active subscriptions
    const activeSubscriptions = await this.userSubscriptionModel.aggregate([
      {
        $match: {
          userId: new ObjectId(userId),
          status: UserSubscriptionStatus.Active,
        },
      },
      {
        $lookup: {
          from: 'subscriptions', // Name of the Subscription collection
          localField: 'subscriptionId', // Field in UserSubscription schema
          foreignField: '_id', // Field in Subscription schema
          as: 'subscriptionDetails', // Output array field
        },
      },
      {
        $unwind: {
          path: '$subscriptionDetails',
          preserveNullAndEmptyArrays: true,
        },
      },
    ]);

    if (activeSubscriptions.length === 0) {
      throw new CustomHttpException(
        HttpStatus.PAYMENT_REQUIRED,
        'SUBSCRIPTION_REQUIRED',
        'No subscription found in your account. Please subscribe to continue.',
      );
    }
    // Calculate the total storage limit from all active subscriptions
    let totalLimit = 0;
    for (const subscription of activeSubscriptions) {
      const storageFeature = subscription.subscriptionDetails.features.find(
        (feature: any) => feature.featureKey === 'storage',
      );
      if (storageFeature && storageFeature.limit) {
        totalLimit += Number(storageFeature.limit);
      }
    }

    if (totalUsage > totalLimit) {
      throw new StorageLimitExceededException(totalUsage, totalLimit)
    }
    return { totalUsage, totalLimit };
  }

  async getUserFilesList(userId: string) {
    try {
      // Fetch all tracks and it's linked files

      // Fetch all project and it's linked files

      // Fetch all collabs and its' linked files

    } catch (err) {
      console.log('ERR: ', err)
    }
  }

  async GenerateOTP(length: number) {
    const otp = Math.floor(Math.random() * Math.pow(10, length)).toString();
    return otp.padStart(length, '0');
  }

  //OTP handler
  async otpHandler(owner: string, dto: OtpDto) {
    const { countryCode, mobile } = dto
    const user = await this.userModel.findById(owner)
    if (!user) {
      return resourceNotFoundError('User')
    }

    //check mobile number exits or not
    const existingUser = await this.userModel.findOne({
      mobile: mobile,
    })
    if (existingUser) {
      return resourceDuplicatedError('Mobile number')
    }

    const code = await this.GenerateOTP(6)
    const expireIn = new Date(Date.now() + 15 * 60 * 1000); //15 minutes
    const otp = {
      code, expireIn
    }

    // Send SMS via Twilio
    const phone = `${countryCode}${mobile}`
    const message = `Your OTP for GUILD platform is ${code}. It will expire in 15 minutes.`;
    await this.smsService.sendSms(phone, message);


    user.otp = otp
    user.mobile = mobile
    user.countryCode = countryCode
    await user.save()
    return true;
  }
}
