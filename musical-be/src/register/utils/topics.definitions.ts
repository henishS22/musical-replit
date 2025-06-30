/**
 *  @file Define all topics for the service
 *  @author Rafael Marques Siqueira
 *  @exports DefinedTopics
 *  @exports getAllTopicsArray
 */

//Defines file type for file upload
export const DefinedTopics = {
  sendRegister: { topic: 'users.register.subscribe' },
};

export function getAllTopicsArray() {
  const topicsArray = [];

  for (const topicKey in DefinedTopics) {
    topicsArray.push(DefinedTopics[topicKey].topic);
  }

  return topicsArray;
}
