import { Inject, Injectable } from '@nestjs/common';
import { ClientKafka } from '@nestjs/microservices';
import { ObjectId } from 'mongodb';
import { NotifiesDefinedExternalTopics } from '../utils/external.topics.definitions';
import { ReactionsTypes } from '../utils/enums';

@Injectable()
export class NotificationsService {
  constructor(@Inject('FEEDS') private readonly clientKafka: ClientKafka) {}

  registerReactedToActivity(
    activityId: string,
    authorId: string | ObjectId,
    reactionId: string,
    reactionType: ReactionsTypes,
    target: string | ObjectId,
  ) {
    this.createNotification({
      activityId,
      from: authorId,
      to: target,
      data: {
        reactionId,
        reactionType,
      },
      topic: NotifiesDefinedExternalTopics.notifiesAddReactedToActivity.topic,
    });
  }

  registerCommentedOnActivity(
    activityId: string,
    authorId: string | ObjectId,
    commentId: string,
    comment: string,
    target: string | ObjectId,
  ) {
    this.createNotification({
      activityId,
      from: authorId,
      to: target,
      data: {
        commentId,
        comment,
      },
      topic: NotifiesDefinedExternalTopics.notifiesAddCommentedOnActivity.topic,
    });
  }

  deleteNotificationsOfActivities(activityId: string) {
    this.clientKafka.emit(NotifiesDefinedExternalTopics.activityDeleted.topic, {
      id: activityId,
    });
  }

  deleteNotificationsOfReactions(reactionId: string) {
    this.clientKafka.emit(NotifiesDefinedExternalTopics.reactionDeleted.topic, {
      id: reactionId,
    });
  }

  deleteNotificationsOfComments(commentId: string) {
    this.clientKafka.emit(NotifiesDefinedExternalTopics.commentDeleted.topic, {
      id: commentId,
    });
  }

  private createNotification({
    activityId,
    from,
    to,
    data,
    topic,
  }: {
    activityId: string;
    from: ObjectId | string;
    to: ObjectId | string;
    data?: Record<string, any>;
    topic: string;
  }) {
    this.clientKafka.emit(topic, {
      activityId,
      fromUserId: from,
      toUserId: to,
      ...data,
    });
  }
}
