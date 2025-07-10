/**
 *  @file Define all topics for the service
 *  @author Rafael Marques Siqueira
 *  @exports DefinedTopics
 *  @exports getAllTopicsArray
 */

type Topic = {
  topic: string;
};

type Topics = {
  getUsersRegisteredAcrossTimeByDevice: Topic;
  getInvitesSent: Topic;
  getCreatedProjects: Topic;
  getCreatedProjectsPerUserAcrossTime: Topic;
  getPostedCollaborations: Topic;
  getPostedCollaborationsPerUserAcrossTime: Topic;
  getAverageUploadedFiles: Topic;
  getUploadedFilesPerUserAcrossTime: Topic;
};

//Defines file type for file upload
export const DefinedTopics: Topics = {
  getUsersRegisteredAcrossTimeByDevice: {
    topic: 'reports.users.per-device-across-time',
  },
  getInvitesSent: {
    topic: 'reports.users.invites-sent',
  },
  getCreatedProjects: {
    topic: 'reports.projects.created',
  },
  getCreatedProjectsPerUserAcrossTime: {
    topic: 'reports.projects.created-across-time',
  },
  getPostedCollaborations: {
    topic: 'reports.collaborations.posted',
  },
  getPostedCollaborationsPerUserAcrossTime: {
    topic: 'reports.collaborations.per-user-across-time',
  },
  getAverageUploadedFiles: {
    topic: 'reports.tracks.average-uploaded-files',
  },
  getUploadedFilesPerUserAcrossTime: {
    topic: 'reports.tracks.per-user-across-time',
  },
};

export function getAllTopicsArray() {
  const topicsArray = [];

  for (const topicKey in DefinedTopics) {
    topicsArray.push(DefinedTopics[topicKey].topic);
  }

  return topicsArray;
}
