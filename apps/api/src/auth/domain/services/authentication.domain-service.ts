import { Injectable } from '@nestjs/common';
import { UserRepository } from 'apps/api/src/users/domain/repositories/user.repository';
import { Password } from 'apps/api/src/shared/domain/value-objects/password';
import { UnauthorizedError } from 'apps/api/src/common/errors/types/UnauthorizedError';
import { UserEntity } from 'apps/api/src/users/domain/entities/user.entity';
import { UserTenantEntity } from 'apps/api/src/users/domain/entities/user-tenant.entity';
import { UserTenantPersistence } from 'apps/api/src/users/infrastructure/persistence';
import { runWithoutTenantFilter } from 'apps/api/src/prisma/middlewares/tenant-filter.middleware';

@Injectable()
export class AuthenticationDomainService {
  constructor(private readonly userRepository: UserRepository) {}

  async authenticateUser(email: string, password: string): Promise<UserEntity> {
    const dummyHash =
      '$2b$12$abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0';

    const userData = await runWithoutTenantFilter(async () => {
      return this.userRepository.findByEmail(email);
    });

    const passwordVO = new Password({ value: password });

    const [userExists, passwordMatch] = await Promise.all([
      Promise.resolve(!!userData),
      userData
        ? passwordVO.matches(userData.password)
        : passwordVO.matches(dummyHash),
    ]);

    if (!userExists || !passwordMatch) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const userTenants = userData?.userTenants?.map(
      (ut: UserTenantPersistence) => UserTenantEntity.reconstitute(ut)
    );

    return UserEntity.reconstitute({
      ...userData!,
      userTenants,
    });
  }

  validateUserHasTenants(user: UserEntity): void {
    if (!user.userTenants || user.userTenants.length === 0) {
      throw new UnauthorizedError('User has no active tenants');
    }
  }

  async validateUserTenantAccess(
    userId: string,
    tenantId: string
  ): Promise<{ user: UserEntity; role: string }> {
    const userTenant = await runWithoutTenantFilter(async () => {
      return this.userRepository.findUserByIdAndTenantId(userId, tenantId);
    });

    if (!userTenant || !userTenant.isActive) {
      throw new UnauthorizedError(
        'User not found in this tenant or access denied'
      );
    }

    const user = UserEntity.reconstitute(userTenant.user);

    return {
      user,
      role: userTenant.role,
    };
  }
}
