import { UserTenant, UserRole, User, Tenant } from '@prisma/client';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';

export class UserTenantEntity implements UserTenant {
  id: string;
  userId: string;
  tenantId: string;
  role: UserRole;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  user?: User;
  tenant?: Partial<Tenant>;

  private constructor(props: Partial<UserTenantEntity>) {
    Object.assign(this, props);
  }

  static reconstitute(
    props: UserTenant & { user?: User; tenant?: Partial<Tenant> }
  ): UserTenantEntity {
    return new UserTenantEntity(props);
  }

  activate(): void {
    if (this.isActive) {
      throw new ConflictError('Associação já está ativa');
    }
    this.isActive = true;
    this.updatedAt = new Date();
  }

  deactivate(): void {
    if (!this.isActive) {
      throw new ConflictError('Associação já está desativada');
    }
    this.isActive = false;
    this.updatedAt = new Date();
  }

  changeRole(newRole: UserRole): void {
    if (this.role === newRole) {
      throw new ConflictError('Usuário já possui este papel');
    }
    this.role = newRole;
    this.updatedAt = new Date();
  }

  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  isTenantOwner(): boolean {
    return this.role === UserRole.TENANT;
  }
}
