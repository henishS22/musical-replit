export enum SplitModelEnum {
  'Equal Split' = 'EQUAL_SPLIT',
  'Customized' = 'CUSTOMIZED',
  'Define Later' = 'DEFINE_LATER',
}

export enum TypeCollaboratorEnum {
  'Single' = 'SINGLE',
  'Album' = 'ALBUM',
}

export enum PermissionProjectEnum {
  // 'Owner' = 'OWNER',
  // 'Editor' = 'EDITOR',
  // 'Musician' = 'MUSICIAN',
  // 'Producer' = 'PRODUCER',
  // 'View Only' = 'VIEW_ONLY',

  'Owner' = 'OWNER',
  'Upload/Download' = 'UPLOAD/DOWNLOAD',
  'Upload Only' = 'UPLOAD_ONLY',
  'Download Only' = 'DOWNLOAD_ONLY',
  'View Only' = 'VIEW_ONLY',
}

export enum StatusReleaseEnum {
  'IN_PROGRESS' = 'IN_PROGRESS',
  'FINISHED' = 'FINISHED',
}

export enum ProjectUpdateEnum {
  'ADDED_FILES_TO_RELEASE' = 'ADDED_FILES_TO_RELEASE',
  'REMOVED_FILES_FROM_RELEASE' = 'REMOVED_FILES_FROM_RELEASE',
  'ADDED_FILES_TO_MAIN_FOLDER' = 'ADDED_FILES_TO_MAIN_FOLDER',
  'UNLINKED_FILES_FROM_MAIN_FOLDER' = 'UNLINKED_FILES_FROM_MAIN_FOLDER',
  'ADDED_FILES_TO_FINAL_VERSION' = 'ADDED_FILES_TO_FINAL_VERSION',
  'REMOVED_FILES_FROM_FINAL_VERSION' = 'REMOVED_FILES_FROM_FINAL_VERSION',
  'CREATED_RELEASE' = 'CREATED_RELEASE',
  'RENAMED_RELEASE' = 'RENAMED_RELEASE',
  'PUBLISHED_RELEASE' = 'PUBLISHED_RELEASE',
  'COMMENT' = 'COMMENT',
  'CREATED_PROJECT' = 'CREATED_PROJECT',
  'RENAMED_PROJECT' = 'RENAMED_PROJECT',
  'MINTED_NFTS' = 'MINTED_NFTS',
}

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
