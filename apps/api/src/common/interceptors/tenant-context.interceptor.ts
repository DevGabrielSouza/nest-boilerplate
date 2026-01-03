import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tenantContext } from '../../prisma/middlewares/tenant-filter.middleware';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  intercept(
    _context: ExecutionContext,
    next: CallHandler
  ): Observable<unknown> {
    return new Observable((observer) => {
      tenantContext.run({ tenantId: null, bypassTenantFilter: false }, () => {
        next.handle().subscribe({
          next: (value) => observer.next(value),
          error: (err) => observer.error(err),
          complete: () => observer.complete(),
        });
      });
    });
  }
}
