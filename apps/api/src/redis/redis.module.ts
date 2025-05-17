import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'REDIS_PROVIDER',
        transport: Transport.REDIS,
        options: {
          host: 'nest_boilerplate_redis',
          port: 6379,
          password: 'your_redis_password',
        },
      },
    ]),
  ],
  providers: [RedisService],
  exports: [RedisService],
})
export class RedisModule {}
