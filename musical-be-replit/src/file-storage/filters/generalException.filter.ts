/**
 *  @file Handle the microservices exceptions and build the error object to throw
 *  @author Rafael Marques Siqueira
 *  @exports GeneralExceptionFilter
 */

import { Catch, ExceptionFilter } from '@nestjs/common';
import { MongoError } from 'mongodb';
import { Observable, throwError } from 'rxjs';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Scope } from '@sentry/node';
import ServiceException from '../exceptions/ServiceException';
import { RpcException } from '@nestjs/microservices';

@Catch()
export class GeneralExceptionFilter implements ExceptionFilter {
  constructor(@InjectSentry() private readonly sentryClient: SentryService) {}

  catch(exception: any): Observable<any> {
    const error = this.getErrorObject(exception);

    let type = 'InternalServerError';

    if (exception instanceof ServiceException) {
      type = exception.getType();
    }

    if (exception instanceof RpcException) {
      type = 'Forbidden';
    }

    const errObj = {
      origin: 'file-storage',
      message: '',
      type,
      stack: exception instanceof Error ? exception.stack : '',
    };

    if (typeof error === 'object' && !(error instanceof ServiceException)) {
      this.registerExceptionOnSentry(error);
    }

    // Definitions for the custom errors if needed

    //Checks if it is a mongo Error
    if (exception instanceof MongoError) {
      errObj.message = exception.errmsg;
      return throwError(() => JSON.stringify(errObj));
    }

    //Checks if has a message key
    if (exception.message) {
      errObj.message = exception.message;
      return throwError(() => JSON.stringify(errObj));
    }

    //Fallback to unknow error
    errObj.message = exception;
    return throwError(() => JSON.stringify(errObj));
  }

  private getErrorObject(error: any): Error {
    if (error instanceof Error) {
      return error;
    }

    if (typeof error === 'string') {
      return new Error(error);
    }

    if (error instanceof Object) {
      return new Error(JSON.stringify(error));
    }
  }

  /**
   * Register exception on Sentry.
   * @param {any} exception Error
   * @param {ArgumentsHost} host
   * @returns {void}
   */
  private registerExceptionOnSentry(exception: any): void {
    const scope = new Scope();
    scope.setTags({
      module: 'file-storage',
    });

    this.sentryClient.instance().captureException(exception, () => scope);
  }
}
