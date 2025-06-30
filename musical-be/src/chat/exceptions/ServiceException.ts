import { ExceptionsEnum } from 'src/utils/enums';

export default class ServiceException extends Error {
  constructor(message: string, private readonly type: ExceptionsEnum) {
    super(message);
  }

  getType(): ExceptionsEnum {
    return this.type;
  }
}
