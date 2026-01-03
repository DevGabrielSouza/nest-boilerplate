import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { CreateTenantDto } from 'apps/api/src/tenants/domain/dto/create-tenant.dto';
import { UserRole } from '@prisma/client';
import { CreateUserDto } from 'apps/api/src/users/domain/dto/create-user.dto';
import { UpdateUserDto } from 'apps/api/src/users/domain/dto/update-user.dto';

@Injectable()
export class UsersRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const newUser = await this.prisma.user.create({
      data: {
        name: createUserDto.name,
        lastName: createUserDto.lastName,
        email: createUserDto.email,
        password: createUserDto.password,
        taxId: createUserDto.taxId,
        image: createUserDto.image,
        emailVerifiedAt: createUserDto.emailVerifiedAt,
        isTwoFactorEnabled: createUserDto.isTwoFactorEnabled,
      },
    });

    return newUser;
  }

  async createUserWithTenant(
    createUserDto: Omit<CreateUserDto, 'confirm_password'>,
    createTenantDto: CreateTenantDto
  ) {
    return this.prisma.tenant.create({
      data: {
        name: createTenantDto.name,
        slug: createTenantDto.slug,
        userTenants: {
          create: {
            role: UserRole.TENANT,
            user: {
              create: {
                name: createUserDto.name,
                lastName: createUserDto.lastName,
                email: createUserDto.email,
                password: createUserDto.password,
                taxId: createUserDto.taxId,
                image: createUserDto.image,
                emailVerifiedAt: createUserDto.emailVerifiedAt,
                isTwoFactorEnabled: createUserDto.isTwoFactorEnabled,
              },
            },
          },
        },
      },
      include: {
        userTenants: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        userTenants: {
          where: { isActive: true },
          include: {
            tenant: true,
          },
        },
      },
    });

    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        userTenants: {
          where: { isActive: true },
          include: {
            tenant: true,
          },
        },
      },
    });

    return user;
  }

  async findUserByIdAndTenantId(userId: string, tenantId: string) {
    const userTenant = await this.prisma.userTenant.findUnique({
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

    return userTenant;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        userTenants: {
          where: { isActive: true },
          include: {
            tenant: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
    return users;
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    const updatedUser = this.prisma.user.update({
      where: { id },
      data: {
        name: updateUserDto.name,
        lastName: updateUserDto.lastName,
        email: updateUserDto.email,
        taxId: updateUserDto.taxId,
        image: updateUserDto.image,
        emailVerifiedAt: updateUserDto.emailVerifiedAt,
        isTwoFactorEnabled: updateUserDto.isTwoFactorEnabled,
      },
    });
    return updatedUser;
  }

  remove(id: string) {
    const deletedUser = this.prisma.user.delete({
      where: { id },
    });
    return deletedUser;
  }
}
