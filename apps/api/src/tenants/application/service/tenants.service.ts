import { Injectable } from '@nestjs/common';
import { Slug } from 'apps/api/src/shared/domain/value-objects/slug';
import { CreateTenantWithUserDto } from 'apps/api/src/tenants/domain/dto/create-tenant-with-user.dto';
import { CreateTenantDto } from 'apps/api/src/tenants/domain/dto/create-tenant.dto';
import { UpdateTenantDto } from 'apps/api/src/tenants/domain/dto/update-tenant.dto';

import { PrismaTenantRepository } from 'apps/api/src/tenants/infrastructure/database/prisma-tenant.repository';
import { UsersService } from 'apps/api/src/users/application/service/users.service';

@Injectable()
export class TenantService {
  constructor(
    private readonly tenantRepository: PrismaTenantRepository,
    private readonly userService: UsersService
  ) {}

  async create(data: CreateTenantDto) {
    const tenantSlug = new Slug({ value: data.name }).value;
    return this.tenantRepository.create(data, tenantSlug);
  }

  async createTenantWithUser(data: CreateTenantWithUserDto) {
    const tenantSlug = new Slug({ value: data.name }).value;

    const tenantData = {
      name: data.name,
      slug: tenantSlug,
    };

    return this.userService.createUserWithTenant(data.user, tenantData);
  }

  getAllTenants() {
    return this.tenantRepository.findAll();
  }

  getTenantById(id: string) {
    return this.tenantRepository.findById(id);
  }

  updateTenant(id: string, data: UpdateTenantDto) {
    return this.tenantRepository.update(id, data);
  }

  deleteTenant(id: string) {
    return this.tenantRepository.delete(id);
  }
}
