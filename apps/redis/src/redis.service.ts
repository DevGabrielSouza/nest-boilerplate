import { Injectable } from '@nestjs/common';

@Injectable()
export class RedisService {
  getHello(): string {
    return 'Hello World!';
  }
}
