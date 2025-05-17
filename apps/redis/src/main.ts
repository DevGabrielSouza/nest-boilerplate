import { NestFactory } from '@nestjs/core';
import { RedisModule } from './redis.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    RedisModule,
    {
      transport: Transport.REDIS,
      options: {
        host: 'nest_boilerplate_redis',
        port: 6379,
        password: 'your_redis_password',
      },
    }
  );
  await app.listen();
}
bootstrap();
