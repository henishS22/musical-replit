import {
  Controller,
  Get,
  Put,
  Param,
  UseGuards,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiBadRequestResponse,
  ApiOperation,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { getStreamGuard } from '../guards/getStream-auth.guard';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetAllFromUserDto } from './dto/getAllFromUserDto';
import { PostContactDto } from './dto/postContactDto';
import { UpdateNotifyDto } from './dto/updateNotifyDto';
import { NotificationResponseDto } from './dto/definitions/notificationResponse.dto';
import { NotifiesService } from './notifies.service';
import { PubSubService } from './services/pubSub.service';
import { UserActivityService } from '../user-activity/user-activity.service';
import { EventTypeEnum } from '../gamificationEvent/utils/enum';

@Controller('notifies')
@ApiTags('Notifies')
@ApiBearerAuth()
export class NotifiesController {
  constructor(private readonly notifiesService: NotifiesService,
    private readonly pubSubServices: PubSubService,
    private readonly userActivityService: UserActivityService
  ) { }

  /**
   * Receive request HTTP GET and send message to get all notications
   * @param userId User Identification
   * @returns All notifications from user
   */
  @UseGuards(JwtAuthGuard)
  @Get('/users')
  @ApiOperation({ summary: 'Get all notifications from user' })
  @ApiOkResponse({
    description: 'Return all notifications from user',
    type: [NotificationResponseDto],
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  getAllFromUser(
    @Param('owner') userId: string,
    @Query() params: GetAllFromUserDto,
  ) {
    return this.notifiesService.getAllFromUser({
      userId,
      ...params,
    });
  }

  /**
   * Receive request HTTP GET and send message to update notify with viewed
   * @param id Notify id
   * @param owner User id owner this notify
   * @returns Notify updated
   */
  @UseGuards(JwtAuthGuard)
  @Put('/:id')
  @ApiOperation({ summary: 'Updates the view state of a notification' })
  @ApiOkResponse({
    description: 'Return notify updated',
    type: NotificationResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Notification not found.' })
  updateNotifyToViewed(
    @Param('owner') owner: string,
    @Param('id') id: string,
    @Body() fields: UpdateNotifyDto,
  ) {
    return this.notifiesService.updateNotifyById({
      owner,
      id,
      fields,
    });
  }

  /**
   * Receive request HTTP GET and send message to update notify with viewed
   * @param id Notify id
   * @param owner User id owner this notify
   * @returns Notify updated
   */
  @UseGuards(JwtAuthGuard)
  @Post('/markAllAsRead')
  @ApiOperation({ summary: 'marks all the users notifications as read' })
  @ApiOkResponse({
    description: 'Return true',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Notification not found.' })
  markAllAsRead(@Param('owner') owner: string) {
    return this.notifiesService.markAllAsRead({
      userId: owner,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('/markAsRead')
  @ApiOperation({ summary: 'marks all the users notifications as read' })
  @ApiOkResponse({
    description: 'Return true',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiForbiddenResponse({ description: 'Forbidden.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  @ApiNotFoundResponse({ description: 'Notification not found.' })
  markAsRead(
    @Param('owner') owner: string,
    @Body('id') id: string,
  ) {
    return this.notifiesService.markAsRead({
      userId: owner,
      id,
    });
  }

  @UseGuards(getStreamGuard)
  @Post('/events')
  @ApiOperation({ summary: 'Get chat events' })
  @ApiOkResponse({
    description: 'Return notify updated',
    type: NotificationResponseDto,
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  getChatWebHooks(@Body() event: any) {
    const buffer = Buffer.from(event);
    return this.notifiesService.registerChatEvent({
      event: JSON.parse(buffer.toString()),
    });
  }

  /**
   * Register informations about user contact
   * @param {PostContactDto} fields Informations to contact
   * @returns void
   */
  @Post('/contact')
  @ApiOperation({ summary: 'Register information about user contact' })
  @ApiOkResponse({
    description: 'Nothing',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  createContactInformations(@Body() fields: PostContactDto) {
    return this.notifiesService.createContactInformations(fields);
  }

  @UseGuards(JwtAuthGuard)
  @Post('/sendInvite')
  @ApiOperation({ summary: 'Send mail by email' })
  @ApiOkResponse({
    description: 'Nothing',
  })
  @ApiUnauthorizedResponse({ description: 'Unauthorized.' })
  @ApiBadRequestResponse({ description: 'Bad request.' })
  async sendEmail(@Param('owner') owner: string, @Body() fields: any) {

    //gamification token assign
    // await this.userActivityService.activity(owner, EventTypeEnum.INVITE_PROJECT_COLLABORATORS)

    return this.notifiesService.sendInviteEmail(owner, fields);
  }

  @UseGuards(JwtAuthGuard)
  @Post('inviteSms')
  async sendInvite(@Param('owner') owner: string, @Body() body: { countryCode: string, phoneNumber: string }) {
    await this.pubSubServices.publishInviteMessage(owner, body);

    //gamification token assign
    // await this.userActivityService.activity(owner, EventTypeEnum.INVITE_PROJECT_COLLABORATORS)

    return { message: 'Invite sent successfully!' };
  }
}
