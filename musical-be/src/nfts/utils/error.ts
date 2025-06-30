import ServiceException from '../exceptions/ServiceException';
import { ExceptionsEnum } from './enums';

export const resourceNotFoundError = () => {
    throw new ServiceException(
        `Owner or Address is mandatory!`,
        ExceptionsEnum.NotFound,
    );
};
