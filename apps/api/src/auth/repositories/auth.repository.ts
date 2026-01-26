import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { AuthLoginDto } from '../domain/dto/auth-login.dto';
import { AuthRegisterDto } from '../domain/dto/auth-register.dto';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';
import { UserRepository } from 'apps/api/src/users/domain/repositories/user.repository';
import { Password } from 'apps/api/src/shared/domain/value-objects/password';
import { NotFoundError } from '../../common/errors/types/NotFoundError';
import { runWithoutTenantFilter } from 'apps/api/src/prisma/middlewares/tenant-filter.middleware';
import { UserRole } from '@prisma/client';
import { UserEntity } from 'apps/api/src/users/domain/entities/user.entity';
import { UserTenantEntity } from 'apps/api/src/users/domain/entities/user-tenant.entity';
import { UserTenantPersistence } from 'apps/api/src/users/infrastructure/persistence';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UserRepository
  ) {}

  async login({ email, password }: AuthLoginDto) {
    const userData = await runWithoutTenantFilter(async () => {
      return this.prisma.user.findUnique({
        where: { email: email },
        include: {
          userTenants: {
            where: { isActive: true },
            include: {
              tenant: true,
            },
          },
        },
      });
    });

    if (!userData) {
      throw new NotFoundError('User not found');
    }

    const passwordVO = new Password({ value: password });
    const matchPassword = await passwordVO.matches(userData.password);

    if (!matchPassword) {
      throw new ConflictError('Email or password is incorrect');
    }

    const userTenants = userData.userTenants?.map((ut: UserTenantPersistence) =>
      UserTenantEntity.reconstitute(ut)
    );

    const user = UserEntity.reconstitute({
      ...userData,
      userTenants,
    });

    return { user };
  }

  async selectTenant(userId: string, tenantId: string) {
    const userTenant = await runWithoutTenantFilter(async () => {
      return this.prisma.userTenant.findUnique({
        where: {
          user_tenant_unique: {
            userId,
            tenantId,
          },
          isActive: true,
        },
        include: {
          user: true,
          tenant: true,
        },
      });
    });

    if (!userTenant) {
      throw new NotFoundError('User not found in this tenant or access denied');
    }

    const user = UserEntity.reconstitute(userTenant.user);

    return {
      user,
      tenantId: userTenant.tenantId,
      role: userTenant.role,
    };
  }

  async register(authRegisterDto: AuthRegisterDto) {
    try {
      const result = await this.usersRepository.createUserWithTenant(
        authRegisterDto,
        {
          name: `${authRegisterDto.name}'s Workspace`,
          slug: `${authRegisterDto.email.split('@')[0]}-workspace`,
        }
      );

      const userTenant = result.userTenants[0];
      const user = UserEntity.reconstitute(userTenant.user);

      return {
        user,
        tenantId: result.id,
        role: UserRole.TENANT,
      };
    } catch {
      throw new ConflictError('Error, please try again.');
    }
  }
}
