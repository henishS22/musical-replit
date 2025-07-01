import ServiceException from '../exceptions/ServiceException';
import { ExceptionsEnum } from './enum';

export const resourceDuplicateError = () => {
    throw new ServiceException(`You already published this mission.`, ExceptionsEnum.Conflict);
};

export const resourceNotFoundError = (resourceName: string) => {
    throw new ServiceException(`${resourceName} not found.`, ExceptionsEnum.NotFound);
};

export const resourceForbiddenError = () => {
    throw new ServiceException(`This Mission is not creator publishable.`, ExceptionsEnum.Forbidden);
};

export const resourceForbidden = () => {
    throw new ServiceException(`This Mission is not created by you.`, ExceptionsEnum.Forbidden);
};