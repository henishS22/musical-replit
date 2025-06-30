import { ExceptionsEnum } from '@/src/utils/enums';
import ServiceException from '../exceptions/ServiceException';

export const resourceDuplicateError = () => {
    throw new ServiceException(`you already joined this mission.`, ExceptionsEnum.Conflict);
};

export const resourceNotFoundError = (resourceName: string) => {
    throw new ServiceException(`${resourceName} not found.`, ExceptionsEnum.NotFound);
};

export const resourceError = (resourceName: string) => {
    throw new ServiceException(`${resourceName} details not match.`, ExceptionsEnum.NotFound);
};

export const resourceOTPError = () => {
    throw new ServiceException(`OTP does not match or expired.`, ExceptionsEnum.NotFound);
};


export const resourceForbiddenError = (resourceName: string) => {
    throw new ServiceException(`${resourceName} already approved so you can't update it.`, ExceptionsEnum.Forbidden);
};
