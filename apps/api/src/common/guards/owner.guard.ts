import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class OwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = request.params.id; // Assumindo que o ID do usuário está nos parâmetros da rota

    if (user.id !== userId) {
      throw new ForbiddenException(
        'You do not have permission to modify this resource'
      );
    }
    return true;
  }
}
