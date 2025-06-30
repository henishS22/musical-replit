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

export enum AyrshareSocialNetworks {
  FACEBOOK = 'facebook',
  GMB = 'gmb',
  INSTAGRAM = 'instagram',
  LINKEDIN = 'linkedin',
  REDDIT = 'reddit',
  TELEGRAM = 'telegram',
  TIKTOK = 'tiktok',
  TWITTER = 'twitter',
  YOUTUBE = 'youtube',
}

export enum AyrshareHashtagPosition {
  AUTO = 'auto',
  END = 'end',
}

export enum WebhookAction {
  FEED = 'feed',
  SOCIAL = 'social',
  SCHEDULED = 'scheduled',
  BATCH = 'batch',
  MESSAGES = 'messages',
}
