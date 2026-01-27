import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '@env-config/config.service';
import { UnauthorizedError } from 'apps/api/src/common/errors/types/UnauthorizedError';
import { UserEntity } from 'apps/api/src/users/domain/entities/user.entity';

export interface TokenPayload {
  name: string;
  email: string;
  role: string;
  tenantId: string;
  isTwoFactorEnabled: boolean;
  sub: string;
}

export interface TempTokenPayload {
  userId: string;
  type: 'tenant-selection';
  exp?: number;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: AppConfigService
  ) {}

  async createAccessToken(
    user: UserEntity,
    tenantId: string,
    role: string
  ): Promise<string> {
    try {
      const secret = this.configService.jwtSecret;
      const accessToken = this.jwtService.sign(
        {
          name: user.name,
          email: user.email,
          role: role,
          tenantId: tenantId,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
        },
        {
          secret,
          expiresIn: this.configService.jwtExpiration,
          subject: String(user.id),
        }
      );

      return accessToken;
    } catch (error) {
      throw new UnauthorizedError(
        `Error creating token: ${(error as Error).message}`
      );
    }
  }

  async createTempToken(userId: string): Promise<string> {
    try {
      const secret = this.configService.jwtSecret;
      return this.jwtService.sign(
        {
          userId,
          type: 'tenant-selection',
        },
        {
          secret,
          expiresIn: '5m',
        }
      );
    } catch (error) {
      throw new UnauthorizedError(
        `Error creating temp token: ${(error as Error).message}`
      );
    }
  }

  verifyToken(token: string): TokenPayload {
    try {
      const secret = this.configService.jwtSecret;
      return this.jwtService.verify(token, { secret }) as TokenPayload;
    } catch (error) {
      throw new UnauthorizedError(
        `Error verifying token: ${(error as Error).message}`
      );
    }
  }

  verifyTempToken(token: string): TempTokenPayload {
    try {
      const secret = this.configService.jwtSecret;
      const payload = this.jwtService.verify(token, {
        secret,
      }) as TempTokenPayload;

      if (payload.type !== 'tenant-selection') {
        throw new UnauthorizedError('Invalid token type');
      }

      return payload;
    } catch (error) {
      throw new UnauthorizedError(
        `Error verifying temp token: ${(error as Error).message}`
      );
    }
  }
}
