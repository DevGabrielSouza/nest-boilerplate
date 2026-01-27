import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RedisService } from 'apps/api/src/redis/redis.service';
import { Request } from 'express';

export const THROTTLE_KEY = 'throttle';

export interface ThrottleOptions {
  limit: number;
  ttl: number;
}

export function Throttle(options: ThrottleOptions) {
  return Reflect.metadata(THROTTLE_KEY, options);
}

@Injectable()
export class ThrottleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly redisService: RedisService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const throttleOptions = this.reflector.get<ThrottleOptions>(
      THROTTLE_KEY,
      context.getHandler()
    );

    if (!throttleOptions) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const identifier = this.getIdentifier(request);
    const key = `throttle:${context.getClass().name}:${context.getHandler().name}:${identifier}`;

    const current = await this.redisService.redis.get(key);
    const currentCount = current ? parseInt(current, 10) : 0;

    if (currentCount >= throttleOptions.limit) {
      const ttl = await this.redisService.redis.ttl(key);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Too many requests. Please try again in ${ttl} seconds.`,
          error: 'Too Many Requests',
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    if (currentCount === 0) {
      await this.redisService.redis.setex(
        key,
        Math.floor(throttleOptions.ttl / 1000),
        '1'
      );
    } else {
      await this.redisService.redis.incr(key);
    }

    return true;
  }

  private getIdentifier(request: Request): string {
    return (
      (request.headers['x-forwarded-for'] as string)?.split(',')[0] ||
      (request.headers['x-real-ip'] as string) ||
      request.ip ||
      request.socket?.remoteAddress ||
      'unknown'
    );
  }
}
