import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './application/service/users.service';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { UserDomainService } from './domain/services/user-domain.service';
import { PrismaUserRepository } from './infrastructure/database/prisma-user.repository';
import { UserRepository } from './domain/repositories/user.repository';
import { UsersController } from './presentation/controller/users.controller';
import { UserActionsController } from './presentation/controller/user-actions.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';
import { DomainEventDispatcher } from 'apps/api/src/shared/domain/events/domain-event-dispatcher';
import { UserRegisteredHandler } from './application/event-handlers/user-registered.handler';
import { UserEmailVerifiedHandler } from './application/event-handlers/user-email-verified.handler';
import { UserTwoFactorEnabledHandler } from './application/event-handlers/user-two-factor-enabled.handler';
import { UserAddedToTenantHandler } from './application/event-handlers/user-added-to-tenant.handler';

@Module({
  controllers: [UsersController, UserActionsController],
  imports: [forwardRef(() => AuthModule), RedisModule],
  providers: [
    UsersService,
    PrismaService,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
    UserDomainService,
    DomainEventDispatcher,
    UserRegisteredHandler,
    UserEmailVerifiedHandler,
    UserTwoFactorEnabledHandler,
    UserAddedToTenantHandler,
  ],
  exports: [
    UsersService,
    UserDomainService,
    DomainEventDispatcher,
    UserRepository,
  ],
})
export class UsersModule {}
