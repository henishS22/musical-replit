/**
 *  @file Define all topics for the service
 *  @author Rafael Marques Siqueira
 *  @exports DefinedTopics
 *  @exports getAllTopicsArray
 */

//Defines file type for file upload
export const DefinedTopics = {
  follow: { topic: 'followers.follow' },
  unfollow: { topic: 'followers.unfollow' },
  followings: { topic: 'followers.followings' },
  followers: { topic: 'followers.followers' },
  rooms: { topic: 'followers.rooms' },
};

export function getAllTopicsArray() {
  const topicsArray = [];

  for (const topicKey in DefinedTopics) {
    topicsArray.push(DefinedTopics[topicKey].topic);
  }

  return topicsArray;
}
