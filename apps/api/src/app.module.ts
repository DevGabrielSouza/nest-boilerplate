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
import { AppBootstrapService } from './core/application/service/app-bootstrap.service';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AppConfigService } from '../../../libs/env-config/src/config.service';

@Module({
  imports: [
    PrismaModule,
    AppConfigModule,
    ThrottlerModule.forRootAsync({
      imports: [AppConfigModule],
      inject: [AppConfigService],
      useFactory: (config: AppConfigService) => [
        {
          ttl: config.rateLimitTtl * 1000,
          limit: config.rateLimitMax,
        },
      ],
    }),
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
    AppBootstrapService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
