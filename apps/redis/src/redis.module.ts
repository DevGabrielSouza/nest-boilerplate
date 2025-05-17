import { Module } from '@nestjs/common';
import { SendEmailModule } from './send-email/send-email.module';
import { BullModule } from '@nestjs/bull';
import { NodemailerModule } from './nodemailer/nodemailer.module';
import { AppConfigModule } from '@env-config/config.module';

@Module({
  imports: [
    BullModule.forRoot({
      redis: {
        host: 'nest_boilerplate_redis',
        port: 6379,
        password: 'your_redis_password',
      },
    }),
    AppConfigModule,
    SendEmailModule,
    NodemailerModule,
  ],
})
export class RedisModule {}
