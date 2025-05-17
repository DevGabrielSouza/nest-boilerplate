import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './application/service/auth.service';
import { AuthController } from './presentation/controller/auth.controller';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { AuthRepository } from './repositories/auth.repository';
import { UsersService } from 'apps/api/src/users/application/service/users.service';
import { UsersRepository } from 'apps/api/src/users/infrastructure/database/users.repository';
import { JwtModule } from '@nestjs/jwt';
import { UsersModule } from 'apps/api/src/users/users.module';
import { AppConfigModule } from 'libs/env-config/src/config.module';
import { AppConfigService } from 'libs/env-config/src/config.service';
import { RedisModule } from '../redis/redis.module';
import { UserPresenter } from './presentation/presenter/user.presenter';
import { CookieService } from './application/service/cookie.service';

@Module({
  controllers: [AuthController],
  imports: [
    JwtModule.registerAsync({
      imports: [AppConfigModule], // Importa o AppConfigModule para resolver dependências
      useFactory: async (configService: AppConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiration },
      }),
      inject: [AppConfigService],
    }),
    forwardRef(() => UsersModule),
    AppConfigModule, // Importa o AppConfigModule
    RedisModule,
  ],
  providers: [
    UsersService,
    UsersRepository,
    CookieService,
    AuthService,
    PrismaService,
    AuthRepository,
    UserPresenter,
  ],
  exports: [AuthService],
})
export class AuthModule {}
