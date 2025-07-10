/**
 *  @file Define all external topics from other services to be used in this service
 *  @author Rafael Marques Siqueira
 *  @exports StorageDefinedExternalTopics
 *  @exports getAllExternalTopicsArray
 */

export const StorageDefinedExternalTopics = {
  storageGetImageUrl: { topic: 'storage.get.image.url' },
};

export const NotifiesDefinedExternalTopics = {
  notifiesAddReactedToActivity: { topic: 'notifies.activity.reacted' },
  activityDeleted: { topic: 'activity.deleted' },
  reactionDeleted: { topic: 'reaction.deleted' },
  commentDeleted: { topic: 'activity.comment.deleted' },
  notifiesAddCommentedOnActivity: { topic: 'notifies.activity.commented' },
};

export function getAllExternalTopicsArray(service: any) {
  const topicsArray = [];

  switch (service) {
    case 'storage':
      for (const topicKey in StorageDefinedExternalTopics) {
        topicsArray.push(StorageDefinedExternalTopics[topicKey].topic);
      }
      break;
    case 'notifies':
      for (const topicKey in NotifiesDefinedExternalTopics) {
        topicsArray.push(NotifiesDefinedExternalTopics[topicKey].topic);
      }
      break;
  }

  return topicsArray;
}
