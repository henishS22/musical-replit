import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, string> {
  intercept(_: ExecutionContext, next: CallHandler): Observable<string> {
    return next.handle().pipe(
      map((data: any) => {
        if (typeof data == 'string') {
          return data;
        }
        return JSON.stringify(data);
      }),
    );
  }
}
