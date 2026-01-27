import { Module, forwardRef } from '@nestjs/common';
import { AuthenticationService } from './application/service/authentication.service';
import { TokenService } from './application/service/token.service';
import { PasswordRecoveryService } from './application/service/password-recovery.service';
import { AuthController } from './presentation/controller/auth.controller';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { AuthRepository } from './repositories/auth.repository';
import { JwtModule } from '@nestjs/jwt';
import { AppConfigModule } from '@env-config/config.module';
import { AppConfigService } from '@env-config/config.service';
import { RedisModule } from '../redis/redis.module';
import { UserPresenter } from './presentation/presenter/user.presenter';
import { CookieService } from './application/service/cookie.service';
import { AuditService } from '../common/services/audit.service';
import { ThrottleGuard } from '../common/guards/throttle.guard';
import { AuthenticationDomainService } from './domain/services/authentication.domain-service';
import { UserRepository } from '../users/domain/repositories/user.repository';
import { PrismaUserRepository } from '../users/infrastructure/database/prisma-user.repository';
import { UserDomainService } from '../users/domain/services/user-domain.service';
import { DomainEventDispatcher } from '../shared/domain/events/domain-event-dispatcher';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from '../common/guards/auth.guard';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [AppConfigModule],
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiration },
      }),
      inject: [AppConfigService],
    }),
    AppConfigModule,
    RedisModule,
    forwardRef(() => UsersModule),
  ],
  providers: [
    CookieService,
    TokenService,
    AuthenticationService,
    PasswordRecoveryService,
    AuthenticationDomainService,
    UserDomainService,
    PrismaService,
    AuthRepository,
    UserPresenter,
    AuditService,
    ThrottleGuard,
    DomainEventDispatcher,
    AuthGuard,
    {
      provide: UserRepository,
      useClass: PrismaUserRepository,
    },
  ],
  exports: [TokenService, AuthenticationService, AuthGuard],
})
export class AuthModule {}
