import { Injectable } from '@nestjs/common';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';

export interface AuditLogData {
  action: string;
  userId: string;
  tenantId: string;
  entity?: string;
  entityId?: string;
  ip?: string;
  userAgent?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(data: AuditLogData): Promise<void> {
    try {
      await this.prisma.log.create({
        data: {
          action: data.action,
          userId: data.userId,
          tenantId: data.tenantId,
          entity: data.entity || 'system',
          entityId: data.entityId || data.userId,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }

  async logLogin(userId: string, tenantId: string): Promise<void> {
    await this.log({
      action: 'USER_LOGIN',
      userId,
      tenantId,
      entity: 'user',
      entityId: userId,
    });
  }

  async logLogout(userId: string, tenantId: string): Promise<void> {
    await this.log({
      action: 'USER_LOGOUT',
      userId,
      tenantId,
      entity: 'user',
      entityId: userId,
    });
  }

  async logPasswordChange(userId: string): Promise<void> {
    const defaultTenantId = 'system';
    await this.log({
      action: 'PASSWORD_CHANGED',
      userId,
      tenantId: defaultTenantId,
      entity: 'user',
      entityId: userId,
    });
  }

  async logTwoFactorEnabled(userId: string): Promise<void> {
    const defaultTenantId = 'system';
    await this.log({
      action: 'TWO_FACTOR_ENABLED',
      userId,
      tenantId: defaultTenantId,
      entity: 'user',
      entityId: userId,
    });
  }

  async logTwoFactorDisabled(userId: string): Promise<void> {
    const defaultTenantId = 'system';
    await this.log({
      action: 'TWO_FACTOR_DISABLED',
      userId,
      tenantId: defaultTenantId,
      entity: 'user',
      entityId: userId,
    });
  }

  async logTenantSwitch(userId: string, toTenantId: string): Promise<void> {
    await this.log({
      action: 'TENANT_SWITCHED',
      userId,
      tenantId: toTenantId,
      entity: 'tenant',
      entityId: toTenantId,
    });
  }
}
