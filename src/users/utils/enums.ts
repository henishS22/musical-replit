export enum InviteStatusEnum {
  AVAILABLE = 'AVAILABLE',
  USED = 'USED',
  SEND = 'SEND',
  COPY = 'COPY',
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

export enum Provider {
  'Metamask',
  'Coinbase',
}

export enum HubspotOriginForm {
  Waitlist = 'waitlist',
  BecomePartner = 'become-partner',
  BattleOfBands = 'battle-of-bands',
  Contact = 'contact',
}

export enum RolesEnum {
  ADMIN = 'ADMIN',
  USER = 'USER',
}
