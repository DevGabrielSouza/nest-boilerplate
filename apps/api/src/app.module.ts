import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AppConfigModule } from '../../../libs/env-config/src/config.module';
import { TenantModule } from './tenants/tenants.module';
import { TenantService } from './tenants/application/service/tenants.service';
import { PrismaTenantRepository } from './tenants/infrastructure/database/prisma-tenant.repository';
import { UsersService } from './users/application/service/users.service';
import { UsersModule } from './users/users.module';
import { UsersRepository } from './users/infrastructure/database/users.repository';
import { RequestContextModule } from './request-provider/request-context.module';
import { RequestContextService } from './request-provider/application/service/request-context.service';
import { AuthModule } from './auth/auth.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    TenantModule,
    UsersModule,
    RequestContextModule,
    AuthModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    UsersService,
    TenantService,
    PrismaTenantRepository,
    UsersRepository,
    RequestContextService,
  ],
})
export class AppModule {}
