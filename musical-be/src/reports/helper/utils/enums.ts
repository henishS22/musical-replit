export enum ExceptionsEnum {
  NotFound = 'NotFound',
  BadRequest = 'BadRequest',
  Unauthorized = 'Unauthorized',
  Forbidden = 'Forbidden',
  InternalServerError = 'InternalServerError',
  UnprocessableEntity = 'UnprocessableEntity',
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}

export enum InviteStatusEnum {
  AVAILABLE = 'AVAILABLE',
  USED = 'USED',
  SEND = 'SEND',
  COPY = 'COPY',
}

export enum TypeCollaboratorEnum {
  'Single' = 'SINGLE',
  'Album' = 'ALBUM',
}
