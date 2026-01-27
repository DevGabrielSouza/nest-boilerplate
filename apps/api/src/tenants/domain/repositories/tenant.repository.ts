import { Tenant } from '@prisma/client';
import { CreateTenantDto } from '../dto/create-tenant.dto';
import { UpdateTenantDto } from '../dto/update-tenant.dto';

export abstract class TenantRepository {
  abstract create(data: CreateTenantDto, slug: string): Promise<Tenant>;

  abstract findAll(): Promise<Tenant[]>;

  abstract findById(id: string): Promise<Tenant | null>;

  abstract findBySlug(slug: string): Promise<Tenant | null>;

  abstract update(id: string, data: UpdateTenantDto): Promise<Tenant>;

  abstract delete(id: string): Promise<Tenant>;
}
