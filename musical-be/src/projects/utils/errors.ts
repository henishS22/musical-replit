import ServiceException from '../exceptions/ServiceException';
import { ExceptionsEnum } from './enums';

export const resourceNotFoundError = (resource: string) => {
  throw new ServiceException(`${resource} not found`, ExceptionsEnum.NotFound);
};

export const resourceDuplicateError = (resource: string) => {
  throw new ServiceException(
    `${resource} already exists`,
    ExceptionsEnum.BadRequest,
  );
};

export const forbiddenError = (resource: string) => {
  throw new ServiceException(`${resource} forbidden`, ExceptionsEnum.Forbidden);
};
