import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { InjectSentry, SentryService } from '@ntegral/nestjs-sentry';
import { Scope } from '@sentry/node';
import { Request } from 'express';
import { ExceptionsEnum, ExceptionStatus } from '../utils/enums';

/**
 * A injectable class for dealing with error expections format
 */

@Injectable()
export class ErrorsInterceptor implements NestInterceptor {
  constructor(@InjectSentry() private readonly sentryClient: SentryService) {}

  /**
   * This method is injectable every time that it threw a error
   * This method must be pure of side effects
   * @function
   * @param {ExecutionContext} context inside a module/requistion
   * @param {CallHandler} next o pipelines
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      timeout(300000),
      catchError((err) => {
        // If the error is an instance of HttpException, pass through its response
        if (err instanceof HttpException) {
          return throwError(() => err);
        }
        
        const errObj = {
          status: 'error',
          message: '',
          origin: '',
          type: '',
          stack: err.stack,
        };

        // Checks if it is a timeout error
        if (err instanceof TimeoutError) {
          errObj.message = 'request timeout';
          delete errObj.origin;
        }
        // Checks if it has response with message
        else if (err.hasOwnProperty('response')) {
          const myResponse = err.response;

          if (myResponse.hasOwnProperty('message')) {
            errObj.message = myResponse.message.toString();
            errObj.origin = err.origin || null;
          }
        }
        // Checks if it has message
        else if (err.hasOwnProperty('message')) {
          errObj.message = err.message;
          errObj.origin = err.origin || null;
          errObj.type = err.type || null;
        }
        // Default error handler
        else {
          errObj.message = err;
        }

        const isHttpException = err instanceof HttpException;
        const httpExceptionStatus = isHttpException && err?.getStatus();
        const serviceExceptionStatus = ExceptionStatus[errObj.type];
        const defaultHttpStatus = 500;

        const httpStatus =
          httpExceptionStatus || serviceExceptionStatus || defaultHttpStatus;

        this.registerErrorOnSentry(
          err,
          errObj.origin || 'api-gateway',
          context,
          httpStatus,
        );

        if (process.env.NODE_ENV !== 'development') {
          delete errObj.stack;

          if (errObj.type === ExceptionsEnum.InternalServerError) {
            errObj.message = 'Internal Server Error';
          }
        }

        return throwError(() => new HttpException(errObj, httpStatus));
      }),
    );
  }

  /**
   * Register an error on sentry.
   *
   * @param {any} err - Error to register
   * @param {String} origin - May be an error coming from a service.
   * @param {ExecutionContext} context - Context inside a module/request
   * @returns {void}
   */
  private registerErrorOnSentry(
    err: any,
    origin: string,
    context: ExecutionContext,
    httpStatus: number,
  ): void {
    const error =
      err instanceof Error ? err : new HttpException(err.message, httpStatus);
    const req = context.switchToHttp().getRequest<Request>();
    const userId = req.params?.owner;
    const {
      url,
      method: requestMethod,
      body: requestBody,
      query: requestQuery,
    } = req;
    const payload = JSON.stringify(requestBody);
    const user = userId ? { id: userId } : null;

    const scope = new Scope();
    scope.setTags({
      'route.controller': context.getClass().name,
      'route.method': context.getHandler().name,
      module: origin,
    });

    if (context.getType() === 'http') {
      scope.setTags({
        'http.url': url,
        'http.method': requestMethod,
      });

      scope.setExtras({
        query: requestQuery,
        payload,
        stack: err.stack || null,
      });
    }

    if (user) {
      scope.setUser(user);
    }

    this.sentryClient.instance().captureException(error, () => scope);
  }
}
