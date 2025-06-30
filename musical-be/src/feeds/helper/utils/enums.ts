export enum ExceptionsEnum {
  NotFound = 'NotFound',
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  InternalServerError = 'InternalServerError',
  UnprocessableEntity = 'UnprocessableEntity',
}

export enum ProjectActivityTypeEnum {
  CREATED_PUBLIC_PROJECT = 'CREATED_PUBLIC_PROJECT',
  CREATED_NFT = 'CREATED_NFT',
  PUBLISHED_A_PROJECT = 'PUBLISHED_A_PROJECT',
  CREATED_COLLABORATION_OPPORTUNITY = 'CREATED_COLLABORATION_OPPORTUNITY',
  ADDED_TRACKS_TO_PROJECT = 'ADDED_TRACKS_TO_PROJECT',
  ADDED_TRACKS_TO_RELEASE = 'ADDED_TRACKS_TO_RELEASE',
  ADDED_TRACKS_TO_FINAL_VERSION = 'ADDED_TRACKS_TO_FINAL_VERSION',
  ADDED_A_COMMENT_ON_A_PROJECT = 'ADDED_A_COMMENT_ON_A_PROJECT',
}

export enum SocialActivityTypeEnum {
  INVITED_USER_JOINED = 'INVITED_USER_JOINED',
}

export type ActivityTypeEnum = ProjectActivityTypeEnum | SocialActivityTypeEnum;

export enum ReactionsTypes {
  COMMENT = 'comment',
  LIKE = 'like',
  WOW = 'wow',
  LOVED = 'loved',
  SAD = 'sad',
}
