import { UserTenantPersistence } from './user-tenant.persistence';

export type UserPersistence = {
  id: string;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
  userTenants?: UserTenantPersistence[];
};
