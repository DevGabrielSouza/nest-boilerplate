import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { UnauthorizedError } from 'apps/api/src/common/errors/types/UnauthorizedError';
import { RequestContextService } from 'apps/api/src/request-provider/application/service/request-context.service';
import { UsersService } from 'apps/api/src/users/application/service/users.service';
import { TokenService } from 'apps/api/src/auth/application/service/token.service';
import { tenantContext } from 'apps/api/src/prisma/middlewares/tenant-filter.middleware';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private readonly requestContextProvider: RequestContextService,
    private readonly tokenService: TokenService,
    private readonly usersService: UsersService
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();

    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedError('Token is missing');
    }

    const tokenData = this.tokenService.verifyToken(token);

    if (!tokenData || !tokenData.tenantId) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    const user = await this.usersService.findOne(tokenData.sub);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    request.user = user;
    request.tokenPayload = tokenData;
    request.tenantId = tokenData.tenantId;

    this.requestContextProvider.setTenantId(tokenData.tenantId);

    const store = tenantContext.getStore();
    if (store) {
      store.tenantId = tokenData.tenantId;
    }

    return next.handle();
  }
}
