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
      data: createUserDto,
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
        User: {
          create: {
            ...createUserDto,
            role: UserRole.TENANT,
          },
        },
      },
      include: {
        User: true,
      },
    });
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    return user;
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    return user;
  }

  async findUserByIdAndTenantId(userId: string, tenantId: string) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        tenantId,
      },
    });

    return user;
  }

  async findAll() {
    const users = await this.prisma.user.findMany({
      include: {
        tenant: {
          select: {
            id: true,
            name: true,
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
        ...updateUserDto,
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
