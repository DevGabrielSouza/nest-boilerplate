import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { TenantService } from 'apps/api/src/tenants/application/service/tenants.service';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  constructor(private readonly tenantService: TenantService) {}

  async use(req: Request, _res: Response, next: NextFunction) {
    const tenantId = String(req.headers['x-tenant-id']) || undefined;

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID is required');
    }

    const tenant = await this.tenantService.getTenantById(tenantId);

    if (!tenant) {
      throw new UnauthorizedException('Tenant not found');
    }

    req['tenantId'] = tenant.id;
    next();
  }
}
