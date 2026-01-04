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
import type { LoginResponse } from '../../domain/types/login-response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly repository: AuthRepository,
    private readonly configService: AppConfigService
  ) {}

  async createToken(user: UserEntity, tenantId: string, role: string) {
    try {
      const secret = this.configService.jwtSecret;
      const expiration = this.configService.jwtExpiration;
      const accessToken = this.jwtService.sign(
        {
          name: user.name,
          email: user.email,
          role: role,
          tenantId: tenantId,
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

  async login(authLoginDto: AuthLoginDto): Promise<LoginResponse> {
    const result = await this.repository.login(authLoginDto);

    if (!result.user.userTenants || result.user.userTenants.length === 0) {
      throw new UnauthorizedError('User has no active tenants');
    }

    if (result.user.userTenants.length === 1) {
      const userTenant = result.user.userTenants[0];
      const token = await this.createToken(
        result.user,
        userTenant.tenantId,
        userTenant.role
      );
      return {
        ...token,
        requiresTenantSelection: false,
        user: result.user,
        selectedTenant: {
          id: userTenant.tenant?.id ?? '',
          name: userTenant.tenant?.name ?? '',
          slug: userTenant.tenant?.slug ?? '',
        },
      };
    }

    return {
      requiresTenantSelection: true,
      user: result.user,
      availableTenants: result.user.userTenants.map((ut) => ({
        id: ut.tenant?.id ?? '',
        name: ut.tenant?.name ?? '',
        slug: ut.tenant?.slug ?? '',
        role: ut.role,
      })),
    };
  }

  async selectTenant(userId: string, tenantId: string) {
    const result = await this.repository.selectTenant(userId, tenantId);

    return this.createToken(result.user, result.tenantId, result.role);
  }

  async register(authRegisterDto: AuthRegisterDto) {
    const result = await this.repository.register(authRegisterDto);
    return this.createToken(result.user, result.tenantId, result.role);
  }

  async forget(authForgetDto: AuthForgetDto) {
    console.log(authForgetDto);
  }

  async reset(authResetDto: AuthResetDto) {
    console.log(authResetDto);
  }

  async getCurrentUser(user: UserEntity): Promise<UserEntity> {
    return user;
  }
}
