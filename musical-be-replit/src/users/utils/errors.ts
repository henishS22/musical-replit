import ServiceException from '../exceptions/ServiceException';
import { ExceptionsEnum } from './enums';

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

export const alreadyExitsError = (resourceName: string) => {
  throw new ServiceException(
    `Please connect with existing ${resourceName}!`,
    ExceptionsEnum.BadRequest,
  );
};

export const skillTypeNotFoundError = () => {
  throw new ServiceException(
    'One or more skills not found!',
    ExceptionsEnum.NotFound,
  );
};

export const stylesTypeNotFoundError = () => {
  throw new ServiceException(
    'One or more styles not found!',
    ExceptionsEnum.NotFound,
  );
};

export const unauthorizedError = (message = 'Unauthorized!') => {
  throw new ServiceException(message, ExceptionsEnum.Unauthorized);
};

export const resourceNotFound = (resourceName: string) => {
  throw new ServiceException(
    `${resourceName}`,
    ExceptionsEnum.BadRequest,
  );
};