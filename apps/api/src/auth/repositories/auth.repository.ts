import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { AuthLoginDto } from '../domain/dto/auth-login.dto';
import { AuthRegisterDto } from '../domain/dto/auth-register.dto';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';
import { UsersRepository } from 'apps/api/src/users/infrastructure/database/users.repository';
import { Password } from 'apps/api/src/shared/domain/value-objects/password';
import { NotFoundError } from '../../common/errors/types/NotFoundError';
import { runWithoutTenantFilter } from 'apps/api/src/prisma/middlewares/tenant-filter.middleware';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly usersRepository: UsersRepository
  ) {}

  async login({ email, password }: AuthLoginDto) {
    const user = await runWithoutTenantFilter(async () => {
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

    if (!user) {
      throw new NotFoundError('User not found');
    }

    const passwordVO = new Password({ value: password });
    const matchPassword = await passwordVO.matches(user.password);

    if (!matchPassword) {
      throw new ConflictError('Email or password is incorrect');
    }

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

    return {
      user: userTenant.user,
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

      return {
        user: userTenant.user,
        tenantId: result.id,
        role: UserRole.TENANT,
      };
    } catch {
      throw new ConflictError('Error, please try again.');
    }
  }
}
