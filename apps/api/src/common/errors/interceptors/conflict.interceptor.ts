import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
} from '@nestjs/common';
import { Observable, catchError } from 'rxjs';
import { ConflictError } from '../types/ConflictError';

@Injectable()
export class ConflictInterceptor<T> implements NestInterceptor<T, T> {
  intercept(_: ExecutionContext, next: CallHandler<T>): Observable<T> {
    return next.handle().pipe(
      catchError((error) => {
        if (error instanceof ConflictError) {
          throw new ConflictException(error.message);
        }

        throw error;
      })
    );
  }
}
