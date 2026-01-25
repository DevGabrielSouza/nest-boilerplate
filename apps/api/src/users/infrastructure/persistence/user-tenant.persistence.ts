import { UserRole } from '@prisma/client';
import { TenantPersistence } from './tenant.persistence';

export type UserTenantPersistence = {
  id: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  tenant?: TenantPersistence;
};
