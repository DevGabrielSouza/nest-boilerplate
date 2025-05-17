import { Module } from '@nestjs/common';
import { PrismaModule } from 'apps/api/src/prisma/prisma.module';
import { TenantController } from './presentation/controller/tenants.controller';
import { TenantService } from './application/service/tenants.service';

import { UsersModule } from 'apps/api/src/users/users.module';
import { PrismaTenantRepository } from './infrastructure/database/prisma-tenant.repository';

@Module({
  imports: [PrismaModule, UsersModule],
  providers: [TenantService, PrismaTenantRepository],
  controllers: [TenantController],
})
export class TenantModule {}
