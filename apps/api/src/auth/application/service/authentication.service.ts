import { Injectable } from '@nestjs/common';
import { AuthLoginDto } from '../../domain/dto/auth-login.dto';
import { AuthRegisterDto } from '../../domain/dto/auth-register.dto';
import { AuthRepository } from '../../repositories/auth.repository';
import { UserEntity } from 'apps/api/src/users/domain/entities/user.entity';
import { TokenService } from './token.service';
import { AuthenticationDomainService } from '../../domain/services/authentication.domain-service';
import { UserDomainService } from 'apps/api/src/users/domain/services/user-domain.service';
import { Password } from 'apps/api/src/shared/domain/value-objects/password';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';

export interface LoginResponse {
  requiresTenantSelection: boolean;
  user?: UserEntity;
  accessToken?: string;
  selectedTenant?: {
    id: string;
    name: string;
    slug: string;
  };
  availableTenants?: Array<{
    id: string;
    name: string;
    slug: string;
    role: string;
  }>;
  selectionToken?: string;
}

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly repository: AuthRepository,
    private readonly tokenService: TokenService,
    private readonly authDomainService: AuthenticationDomainService,
    private readonly userDomainService: UserDomainService,
    private readonly eventDispatcher: DomainEventDispatcher
  ) {}

  async login(authLoginDto: AuthLoginDto): Promise<LoginResponse> {
    const user = await this.authDomainService.authenticateUser(
      authLoginDto.email,
      authLoginDto.password
    );

    this.authDomainService.validateUserHasTenants(user);

    if (user.userTenants!.length === 1) {
      const userTenant = user.userTenants![0];
      const accessToken = await this.tokenService.createAccessToken(
        user,
        userTenant.tenantId,
        userTenant.role
      );

      return {
        requiresTenantSelection: false,
        accessToken,
        user,
        selectedTenant: {
          id: userTenant.tenant?.id ?? '',
          name: userTenant.tenant?.name ?? '',
          slug: userTenant.tenant?.slug ?? '',
        },
      };
    }

    const selectionToken = await this.tokenService.createTempToken(user.id);

    return {
      requiresTenantSelection: true,
      user,
      availableTenants: user.userTenants!.map((ut) => ({
        id: ut.tenant?.id ?? '',
        name: ut.tenant?.name ?? '',
        slug: ut.tenant?.slug ?? '',
        role: ut.role,
      })),
      selectionToken,
    };
  }

  async selectTenant(
    selectionToken: string,
    tenantId: string
  ): Promise<{ accessToken: string }> {
    const tempPayload = this.tokenService.verifyTempToken(selectionToken);

    const { user, role } =
      await this.authDomainService.validateUserTenantAccess(
        tempPayload.userId,
        tenantId
      );

    const accessToken = await this.tokenService.createAccessToken(
      user,
      tenantId,
      role
    );

    return { accessToken };
  }

  async register(
    authRegisterDto: AuthRegisterDto
  ): Promise<{ accessToken: string }> {
    await this.userDomainService.ensureUserDoesNotExist(authRegisterDto.email);

    const password = new Password({
      value: authRegisterDto.password,
      confirmValue: authRegisterDto.confirm_password,
    });
    const hashedPassword = await password.toHashed();

    const { user, tenantId, role } = await this.repository.register({
      ...authRegisterDto,
      password: hashedPassword,
    });

    const userAggregate = UserEntity.reconstitute(user);
    userAggregate.addToTenant(tenantId, role);
    await this.eventDispatcher.dispatchAll(userAggregate.pullDomainEvents());

    const accessToken = await this.tokenService.createAccessToken(
      user,
      tenantId,
      role
    );

    return { accessToken };
  }

  async getCurrentUser(user: UserEntity): Promise<UserEntity> {
    return user;
  }
}
