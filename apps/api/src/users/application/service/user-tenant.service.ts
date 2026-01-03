import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { UserRole } from '@prisma/client';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';
import { NotFoundError } from 'apps/api/src/common/errors/types/NotFoundError';

@Injectable()
export class UserTenantService {
  constructor(private readonly prisma: PrismaService) {}

  async addUserToTenant(
    userId: string,
    tenantId: string,
    role: UserRole = UserRole.USER
  ) {
    const exists = await this.prisma.userTenant.findUnique({
      where: {
        user_tenant_unique: {
          userId,
          tenantId,
        },
      },
    });

    if (exists) {
      throw new ConflictError('User already belongs to this tenant');
    }

    return this.prisma.userTenant.create({
      data: {
        userId,
        tenantId,
        role,
        isActive: true,
      },
      include: {
        user: true,
        tenant: true,
      },
    });
  }

  async removeUserFromTenant(userId: string, tenantId: string) {
    const userTenant = await this.prisma.userTenant.findUnique({
      where: {
        user_tenant_unique: {
          userId,
          tenantId,
        },
      },
    });

    if (!userTenant) {
      throw new NotFoundError('User not found in this tenant');
    }

    return this.prisma.userTenant.delete({
      where: {
        user_tenant_unique: {
          userId,
          tenantId,
        },
      },
    });
  }

  async updateUserRole(userId: string, tenantId: string, role: UserRole) {
    return this.prisma.userTenant.update({
      where: {
        user_tenant_unique: {
          userId,
          tenantId,
        },
      },
      data: {
        role,
      },
      include: {
        user: true,
        tenant: true,
      },
    });
  }

  async deactivateUserInTenant(userId: string, tenantId: string) {
    return this.prisma.userTenant.update({
      where: {
        user_tenant_unique: {
          userId,
          tenantId,
        },
      },
      data: {
        isActive: false,
      },
    });
  }

  async activateUserInTenant(userId: string, tenantId: string) {
    return this.prisma.userTenant.update({
      where: {
        user_tenant_unique: {
          userId,
          tenantId,
        },
      },
      data: {
        isActive: true,
      },
    });
  }

  async getUserTenants(userId: string) {
    return this.prisma.userTenant.findMany({
      where: {
        userId,
        isActive: true,
      },
      include: {
        tenant: true,
      },
    });
  }

  async getTenantUsers(tenantId: string) {
    return this.prisma.userTenant.findMany({
      where: {
        tenantId,
        isActive: true,
      },
      include: {
        user: true,
      },
    });
  }
}
