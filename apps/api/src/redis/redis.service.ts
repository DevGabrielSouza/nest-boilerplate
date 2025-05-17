import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_PROVIDER') private readonly redisService: ClientProxy
  ) {}

  public async get(key: string): Promise<string> {
    return this.redisService.send<string, string>('get', key).toPromise();
  }

  get redis() {
    return this.redisService;
  }
}
