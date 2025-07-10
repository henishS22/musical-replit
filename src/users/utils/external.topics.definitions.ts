export const FeedsDefinedExternalTopics = {
  createdCollaborationOpportinity: {
    topic: 'feeds.add.created_collaboration_opportunity',
  },
  followFeed: { topic: 'feeds.user.followed' },
  unfollowFeed: { topic: 'feeds.user.unfollowed' },
  invitedUserJoined: { topic: 'feeds.add.invited_user_joined' },
};

export function getAllExternalTopicsArray(service: string) {
  const topicsArray = [];

  switch (service) {
    case 'feeds':
      for (const topicKey in FeedsDefinedExternalTopics) {
        topicsArray.push(FeedsDefinedExternalTopics[topicKey].topic);
      }
      break;
  }

  return topicsArray;
}
