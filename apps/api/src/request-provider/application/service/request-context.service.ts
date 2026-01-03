import { Injectable, Scope } from '@nestjs/common';
import { tenantContext } from 'apps/api/src/prisma/middlewares/tenant-filter.middleware';

@Injectable({ scope: Scope.REQUEST })
export class RequestContextService {
  private tenantId: string;

  setTenantId(tenantId: string) {
    this.tenantId = tenantId;

    const currentContext = tenantContext.getStore();
    if (currentContext) {
      currentContext.tenantId = tenantId;
    }
  }

  getTenantId(): string {
    return this.tenantId;
  }

  clearTenantId() {
    this.tenantId = null;

    const currentContext = tenantContext.getStore();
    if (currentContext) {
      currentContext.tenantId = null;
    }
  }
}
