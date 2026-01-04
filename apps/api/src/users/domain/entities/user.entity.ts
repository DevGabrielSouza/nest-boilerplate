import { User, Session, TwoFactorConfirmation, UserRole } from '@prisma/client';
import { AggregateRoot } from 'apps/api/src/shared/domain/aggregate-root.base';
import { UserRegisteredEvent } from '../events/user-registered.event';
import { UserEmailVerifiedEvent } from '../events/user-email-verified.event';
import { UserTwoFactorEnabledEvent } from '../events/user-two-factor-enabled.event';
import { UserTwoFactorDisabledEvent } from '../events/user-two-factor-disabled.event';
import { UserAddedToTenantEvent } from '../events/user-added-to-tenant.event';
import { UserTenantEntity } from './user-tenant.entity';
import { ConflictError } from 'apps/api/src/common/errors/types/ConflictError';

export class UserEntity extends AggregateRoot implements User {
  id: string;
  taxId: string | null;
  name: string;
  lastName: string;
  email: string;
  emailVerifiedAt: Date | null;
  password: string;
  image: string | null;
  isTwoFactorEnabled: boolean;
  twoFactorConfirmation?: TwoFactorConfirmation;
  sessions?: Session[];
  userTenants?: UserTenantEntity[];
  createdAt: Date;
  updatedAt: Date;

  private constructor(props: Partial<UserEntity>) {
    super();
    Object.assign(this, props);
  }

  static create(props: {
    id: string;
    name: string;
    lastName: string;
    email: string;
    password: string;
    taxId?: string;
    image?: string;
    tenantId?: string;
  }): UserEntity {
    const user = new UserEntity({
      id: props.id,
      name: props.name,
      lastName: props.lastName,
      email: props.email,
      password: props.password,
      taxId: props.taxId || null,
      image: props.image || null,
      emailVerifiedAt: null,
      isTwoFactorEnabled: false,
      userTenants: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    user.addDomainEvent(
      new UserRegisteredEvent(
        user.id,
        user.email,
        user.name,
        user.lastName,
        props.tenantId
      )
    );

    return user;
  }

  static reconstitute(
    props: User & { userTenants?: UserTenantEntity[] }
  ): UserEntity {
    return new UserEntity(props);
  }

  get fullName(): string {
    return `${this.name} ${this.lastName}`;
  }

  get isEmailVerified(): boolean {
    return this.emailVerifiedAt !== null;
  }

  verifyEmail(): void {
    if (this.isEmailVerified) {
      throw new ConflictError('Email já foi verificado');
    }

    this.emailVerifiedAt = new Date();
    this.updatedAt = new Date();

    this.addDomainEvent(
      new UserEmailVerifiedEvent(this.id, this.email, this.emailVerifiedAt)
    );
  }

  enableTwoFactor(): void {
    if (this.isTwoFactorEnabled) {
      throw new ConflictError('Autenticação de dois fatores já está ativada');
    }

    this.isTwoFactorEnabled = true;
    this.updatedAt = new Date();

    this.addDomainEvent(new UserTwoFactorEnabledEvent(this.id, this.email));
  }

  disableTwoFactor(): void {
    if (!this.isTwoFactorEnabled) {
      throw new ConflictError(
        'Autenticação de dois fatores já está desativada'
      );
    }

    this.isTwoFactorEnabled = false;
    this.twoFactorConfirmation = undefined;
    this.updatedAt = new Date();

    this.addDomainEvent(new UserTwoFactorDisabledEvent(this.id, this.email));
  }

  updateProfile(props: {
    name?: string;
    lastName?: string;
    taxId?: string;
    image?: string;
  }): void {
    if (props.name) this.name = props.name;
    if (props.lastName) this.lastName = props.lastName;
    if (props.taxId !== undefined) this.taxId = props.taxId;
    if (props.image !== undefined) this.image = props.image;

    this.updatedAt = new Date();
  }

  updatePassword(hashedPassword: string): void {
    this.password = hashedPassword;
    this.updatedAt = new Date();
  }

  addToTenant(tenantId: string, role: UserRole): void {
    if (this.isInTenant(tenantId)) {
      throw new ConflictError('Usuário já pertence a este tenant');
    }

    this.addDomainEvent(new UserAddedToTenantEvent(this.id, tenantId, role));
  }

  isInTenant(tenantId: string): boolean {
    if (!this.userTenants) return false;
    return this.userTenants.some(
      (ut) => ut.tenantId === tenantId && ut.isActive
    );
  }

  canAccessTenant(tenantId: string): boolean {
    return this.isInTenant(tenantId);
  }

  getActiveTenants(): UserTenantEntity[] {
    if (!this.userTenants) return [];
    return this.userTenants.filter((ut) => ut.isActive);
  }

  hasActiveTenants(): boolean {
    return this.getActiveTenants().length > 0;
  }

  getRoleInTenant(tenantId: string): UserRole | null {
    if (!this.userTenants) return null;

    const userTenant = this.userTenants.find(
      (ut) => ut.tenantId === tenantId && ut.isActive
    );

    return userTenant ? userTenant.role : null;
  }

  isAdmin(): boolean {
    if (!this.userTenants) return false;
    return this.userTenants.some(
      (ut) => ut.role === UserRole.ADMIN && ut.isActive
    );
  }

  validate(): void {
    if (!this.email || !this.email.includes('@')) {
      throw new Error('Email inválido');
    }

    if (!this.name || this.name.trim().length === 0) {
      throw new Error('Nome é obrigatório');
    }

    if (!this.lastName || this.lastName.trim().length === 0) {
      throw new Error('Sobrenome é obrigatório');
    }

    if (!this.password || this.password.length < 6) {
      throw new Error('Senha deve ter no mínimo 6 caracteres');
    }
  }
}
