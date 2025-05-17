import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UsersService } from 'apps/api/src/users/application/service/users.service';
import { UnauthorizedError } from '../errors/types/UnauthorizedError';

@Injectable()
export class TenantAuthGuard implements CanActivate {
  constructor(private readonly usersService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const tenantId = request.tenantId || request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedError('Tenant ID is required');
    }

    const user = request.user;

    if (!user) {
      throw new UnauthorizedError('User not found in request');
    }

    // Validar se o usuário pertence ao tenant
    const isValidTenantUser = await this.usersService.findUserByIdAndTenantId(
      user.id,
      tenantId
    );

    if (!isValidTenantUser) {
      throw new UnauthorizedError(
        'User does not belong to the specified tenant'
      );
    }

    request.tenantId = tenantId;
    return true;
  }
}
