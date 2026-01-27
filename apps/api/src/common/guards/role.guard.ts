import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { Role } from '../enums/role.enum';
import { TokenPayload } from 'apps/api/src/auth/application/service/token.service';

interface RequestWithAuth extends Request {
  tokenPayload?: TokenPayload;
  user?: unknown;
}

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const tokenPayload = request.tokenPayload;

    if (!tokenPayload) {
      return false;
    }

    return requiredRoles.some((role) => tokenPayload.role === role);
  }
}
