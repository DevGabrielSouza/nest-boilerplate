import { Inject, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RedisService {
  constructor(
    @Inject('REDIS_PROVIDER') private readonly redisService: ClientProxy
  ) {}

  public async get(key: string): Promise<string | null> {
    try {
      return await firstValueFrom(
        this.redisService.send<string, string>('get', key)
      );
    } catch {
      return null;
    }
  }

  public async set(
    key: string,
    value: string,
    mode?: string,
    duration?: number
  ): Promise<string> {
    const args = [key, value];
    if (mode && duration) {
      args.push(mode, String(duration));
    }
    return await firstValueFrom(
      this.redisService.send<string, string[]>('set', args)
    );
  }

  public async setex(
    key: string,
    seconds: number,
    value: string
  ): Promise<string> {
    return await firstValueFrom(
      this.redisService.send<string, [string, number, string]>('setex', [
        key,
        seconds,
        value,
      ])
    );
  }

  public async del(key: string): Promise<number> {
    return await firstValueFrom(
      this.redisService.send<number, string>('del', key)
    );
  }

  public async incr(key: string): Promise<number> {
    return await firstValueFrom(
      this.redisService.send<number, string>('incr', key)
    );
  }

  public async ttl(key: string): Promise<number> {
    return await firstValueFrom(
      this.redisService.send<number, string>('ttl', key)
    );
  }

  get redis() {
    return {
      get: this.get.bind(this),
      set: this.set.bind(this),
      setex: this.setex.bind(this),
      del: this.del.bind(this),
      incr: this.incr.bind(this),
      ttl: this.ttl.bind(this),
      emit: this.redisService.emit.bind(this.redisService),
    };
  }
}
