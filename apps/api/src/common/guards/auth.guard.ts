import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { UserEntity } from '../../users/domain/entities/user.entity';
import { AuthService } from '../../auth/application/service/auth.service';
import { UsersService } from '../../users/application/service/users.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const cookieHeader = request.headers['cookie'];
    const token =
      request.cookies?.accessToken ?? this.extractAccessToken(cookieHeader);

    const jwt = token?.startsWith('accessToken=') ? token.split('=')[1] : token;
    if (!token) return false;

    try {
      const tokenPayload = this.authService.checkToken(jwt);

      const user: UserEntity | null = await this.usersService.findOne(
        tokenPayload.sub as string
      );

      if (!user || !tokenPayload.tenantId) return false;

      request.user = user;
      request.tokenPayload = tokenPayload;
      request.tenantId = tokenPayload.tenantId;

      return true;
    } catch {
      return false;
    }
  }

  private extractAccessToken(cookieHeader?: string): string | undefined {
    if (!cookieHeader) return undefined;
    const cookies = cookieHeader.split(';').map((cookie) => cookie.trim());
    const accessToken = cookies.find((cookie) =>
      cookie.startsWith('accessToken=')
    );
    return accessToken?.split('=')[1];
  }
}
