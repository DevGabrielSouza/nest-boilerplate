import { Injectable } from '@nestjs/common';
import { AuthLoginDto } from '../../domain/dto/auth-login.dto';
import { JwtService } from '@nestjs/jwt';
import { AuthRegisterDto } from '../../domain/dto/auth-register.dto';
import { AuthForgetDto } from '../../domain/dto/auth-forget.dto';
import { AuthResetDto } from '../../domain/dto/auth-reset.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { UserEntity } from 'apps/api/src/users/domain/entities/user.entity';
import { AppConfigService } from 'libs/env-config/src/config.service';
import { UnauthorizedError } from 'apps/api/src/common/errors/types/UnauthorizedError';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly repository: AuthRepository,
    private readonly configService: AppConfigService
  ) {}

  async createToken(user: UserEntity) {
    try {
      const secret = this.configService.jwtSecret;
      const expiration = this.configService.jwtExpiration;
      const accessToken = this.jwtService.sign(
        {
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
          isTwoFactorEnabled: user.isTwoFactorEnabled,
        },
        { secret, expiresIn: expiration, subject: String(user.id) }
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedError(`Error creating token: ${error.message}`);
    }
  }

  checkToken(token: string) {
    try {
      const secret = this.configService.jwtSecret;
      return this.jwtService.verify(token, { secret });
    } catch (error) {
      throw new UnauthorizedError(`Error verifying token: ${error.message}`);
    }
  }

  async login(authLoginDto: AuthLoginDto) {
    const user = await this.repository.login(authLoginDto);
    return this.createToken(user);
  }

  async register(authRegisterDto: AuthRegisterDto) {
    const user = await this.repository.register(authRegisterDto);
    return this.createToken(user);
  }

  async forget(authForgetDto: AuthForgetDto) {
    console.log(authForgetDto);
    // return this.jwtService.sign();
  }

  async reset(authResetDto: AuthResetDto) {
    console.log(authResetDto);
  }

  async getCurrentUser(user: UserEntity): Promise<UserEntity> {
    return user;
  }
}
