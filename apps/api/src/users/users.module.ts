import { forwardRef, Module } from '@nestjs/common';
import { UsersService } from './application/service/users.service';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { UserDomainService } from './domain/services/user-domain.service';
import { UsersRepository } from './infrastructure/database/users.repository';
import { UsersController } from './presentation/controller/users.controller';
import { AuthModule } from '../auth/auth.module';
import { RedisModule } from '../redis/redis.module';

@Module({
  controllers: [UsersController],
  imports: [forwardRef(() => AuthModule), RedisModule],
  providers: [UsersService, PrismaService, UsersRepository, UserDomainService],
  exports: [UsersService, UserDomainService],
})
export class UsersModule {}
