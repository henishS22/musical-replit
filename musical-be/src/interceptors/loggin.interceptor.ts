import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

/**
 * A injectable class for log all requests details
 */

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    const startTime = Date.now();
    const payload = JSON.stringify(req.body);
    this.logger.log(`Start request to ${req.method} ${req.url}`);

    return next.handle().pipe(
      tap(() => {
        const ellapsed = Date.now() - startTime;
        this.logger.log(
          `Completed request from: ${req.method} ${req.url} ${payload} ` +
            `response: ${'OK'} ` +
            `ellapsed: ${ellapsed}ms`,
        );
      }),
      catchError((error) => {
        const ellapsed = Date.now() - startTime;
        this.logger.error(
          `Request error from: ${req.method} ${req.url} ${payload}`,
        );
        this.logger.error(`ellapsed: ${ellapsed}ms`);
        this.logger.error(`error: ${error.message}`);
        return throwError(() => error);
      }),
    );
  }
}
