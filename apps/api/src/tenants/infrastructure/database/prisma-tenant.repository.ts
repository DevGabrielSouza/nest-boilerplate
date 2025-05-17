import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { CreateTenantDto } from '../../domain/dto/create-tenant.dto';
import { UpdateTenantDto } from '../../domain/dto/update-tenant.dto';
import { UserRole } from '@prisma/client';
import { CreateTenantWithUserDto } from 'apps/api/src/tenants/domain/dto/create-tenant-with-user.dto';

@Injectable()
export class PrismaTenantRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateTenantDto, slug: string) {
    return this.prisma.tenant.create({ data: { ...data, slug } });
  }

  async createTenantWithUser(
    data: CreateTenantWithUserDto,
    tenantSlug: string
  ) {
    return this.prisma.tenant.create({
      data: {
        name: data.name,
        slug: tenantSlug,
        User: {
          create: {
            name: data.user.name,
            lastName: data.user.lastName,
            email: data.user.email,
            password: data.user.password,
            role: UserRole.TENANT,
            taxId: data.user.taxId,
            image: data.user.image,
            emailVerifiedAt: data.user.emailVerifiedAt,
            isTwoFactorEnabled: false,
          },
        },
      },
    });
  }

  findAll() {
    return this.prisma.tenant.findMany();
  }

  findById(id: string) {
    return this.prisma.tenant.findUnique({ where: { id } });
  }

  update(id: string, data: UpdateTenantDto) {
    return this.prisma.tenant.update({
      where: { id },
      data,
    });
  }

  delete(id: string) {
    return this.prisma.tenant.delete({ where: { id } });
  }
}
