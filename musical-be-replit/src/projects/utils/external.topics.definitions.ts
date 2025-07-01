export const FeedsDefinedExternalTopics = {
  followFeed: { topic: 'feeds.user.followed' },
  unfollowFeed: { topic: 'feeds.user.unfollowed' },
  addedCommentOnProject: { topic: 'feeds.add.commented_on_project' },
  addedTracksToProject: { topic: 'feeds.add.added_tracks_to_project' },
  addedTracksToRelease: { topic: 'feeds.add.added_tracks_to_release' },
};

export const GeneralDefinedExternalTopics = {
  releaseWasDeleted: { topic: 'release.was.deleted' },
};

export function getAllExternalTopicsArray(service: any) {
  const topicsArray = [];

  switch (service) {
    case 'feeds':
      for (const topicKey in FeedsDefinedExternalTopics) {
        topicsArray.push(FeedsDefinedExternalTopics[topicKey].topic);
      }
      break;
    case 'general':
      for (const topicKey in GeneralDefinedExternalTopics) {
        topicsArray.push(GeneralDefinedExternalTopics[topicKey].topic);
      }
      break;
  }

  return topicsArray;
}
