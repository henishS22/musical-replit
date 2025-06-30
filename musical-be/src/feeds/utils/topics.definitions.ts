/**
 *  @file Define all topics for the service
 *  @author Rafael Marques Siqueira
 *  @exports DefinedTopics
 *  @exports getAllTopicsArray
 */

//Defines file type for file upload
export const DefinedTopics = {
  getActivities: { topic: 'feeds.get.activities' },
  getActivity: { topic: 'feeds.get.activity' },
  commentOnActivity: { topic: 'feeds.comment' },
  deleteCommentFromActivity: { topic: 'feeds.comment.delete' },
  changeReactionOfActivity: { topic: 'feeds.react' },
  getReactions: { topic: 'feeds.reactions.get' },
};

export function getAllTopicsArray() {
  const topicsArray = [];

  for (const topicKey in DefinedTopics) {
    topicsArray.push(DefinedTopics[topicKey].topic);
  }

  return topicsArray;
}
