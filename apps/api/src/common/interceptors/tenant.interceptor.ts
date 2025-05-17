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
import { AuthService } from 'apps/api/src/auth/application/service/auth.service';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private readonly requestContextProvider: RequestContextService,
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest();

    // Recuperar o token dos cookies
    const token = request.cookies?.accessToken;

    if (!token) {
      throw new UnauthorizedError('Token is missing');
    }

    // Validar o token
    const tokenData = this.authService.checkToken(token);

    if (!tokenData) {
      throw new UnauthorizedError('Invalid or expired token');
    }

    // Recuperar o usuário logado a partir do token
    const user = await this.usersService.findOne(tokenData.sub as string);

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    if (!user.tenantId) {
      throw new UnauthorizedError('Tenant ID is required for the user');
    }

    // Injetar o tenantId e o usuário no request
    request.user = user;
    request.tokenPayload = tokenData;
    request.tenantId = user.tenantId;

    // Injetar o tenantId no contexto global para serviços
    this.requestContextProvider.setTenantId(user.tenantId);

    return next.handle();
  }
}
