import ServiceException from '../exceptions/ServiceException';
import { ExceptionsEnum } from './types';

export const resourceNotFoundError = (resourceName: string) => {
  throw new ServiceException(
    `${resourceName} not found!`,
    ExceptionsEnum.NotFound,
  );
};

export const resourceDuplicatedError = (resourceName: string) => {
  throw new ServiceException(
    `${resourceName} duplicated!`,
    ExceptionsEnum.Conflict,
  );
};

export const resourceForbiddenError = () => {
  throw new ServiceException(`You don't have a permission to update it.`, ExceptionsEnum.Forbidden);
};