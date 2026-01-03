import { UserTenant, UserRole, User, Tenant } from '@prisma/client';

export class UserTenantEntity implements UserTenant {
  id: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  tenant?: Tenant;
}
