export enum SplitModelEnum {
  'Equal Split' = 'EQUAL_SPLIT',
  'Customized' = 'CUSTOMIZED',
  'Define Later' = 'DEFINE_LATER',
}

export enum TypeCollaboratorEnum {
  'Single' = 'SINGLE',
  'Album' = 'ALBUM',
}

// export enum PermissionProjectEnum {
//   'Owner' = 'OWNER',
//   'Editor' = 'EDITOR',
//   'Musician' = 'MUSICIAN',
//   'Producer' = 'PRODUCER',
//   'View Only' = 'VIEW_ONLY',
// }

export enum PermissionProjectEnum {
  'Owner' = 'OWNER',
  'Upload/Download' = 'UPLOAD/DOWNLOAD',
  'Upload Only' = 'UPLOAD_ONLY',
  'Download Only' = 'DOWNLOAD_ONLY',
  'View Only' = 'VIEW_ONLY',
}

export enum ExceptionsEnum {
  NotFound = 'NotFound',
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  InternalServerError = 'InternalServerError',
  UnprocessableEntity = 'UnprocessableEntity',
  Conflict = 'Conflict',
}

export enum ExceptionStatus {
  NotFound = 404,
  BadRequest = 400,
  Unauthorized = 401,
  Forbidden = 403,
  InternalServerError = 500,
  UnprocessableEntity = 422,
  Conflict = 409,
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
