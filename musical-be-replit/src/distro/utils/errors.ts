import ServiceException from '../exceptions/ServiceException';
import { ExceptionsEnum } from './enum';

export const resourceDuplicateError = (resourceName: string) => {
    throw new ServiceException(`${resourceName} already exists.`, ExceptionsEnum.Conflict);
};

export const resourceNotFoundError = (resourceName: string) => {
    throw new ServiceException(`${resourceName} not found.`, ExceptionsEnum.NotFound);
};

export const resourceForbiddenError = (resourceName: string) => {
    throw new ServiceException(`${resourceName} already approved so you can't update it.`, ExceptionsEnum.Forbidden);
};
