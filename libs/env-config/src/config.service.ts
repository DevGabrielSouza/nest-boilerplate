import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from './env.schema';

@Injectable()
export class AppConfigService {
  private readonly envConfig: EnvConfig;

  constructor(configService: ConfigService) {
    const envConfig = configService.get<EnvConfig>('envConfig');
    if (!envConfig) {
      throw new Error('Configuration not found');
    }
    this.envConfig = envConfig;
  }

  get port(): number {
    return this.envConfig.APP_PORT;
  }

  get nodeEnv(): string {
    return this.envConfig.NODE_ENV;
  }

  get jwtSecret(): string {
    return this.envConfig.JWT_SECRET;
  }

  get jwtExpiration(): string {
    return this.envConfig.JWT_EXPIRES_IN;
  }

  get frontendUrl(): string {
    return this.envConfig.FRONTEND_URL;
  }

  get domainName(): string {
    return this.envConfig.DOMAIN_NAME;
  }

  get dbHost(): string {
    return this.envConfig.DB_HOST;
  }

  get dbPort(): number {
    return this.envConfig.DB_PORT;
  }

  get dbUser(): string {
    return this.envConfig.DB_USER;
  }

  get dbPassword(): string {
    return this.envConfig.DB_PASSWORD;
  }

  get dbName(): string {
    return this.envConfig.DB_NAME;
  }

  get databaseUrl(): string {
    return this.envConfig.DATABASE_URL;
  }

  get redisHost(): string {
    return this.envConfig.REDIS_HOST;
  }

  get redisPort(): number {
    return this.envConfig.REDIS_PORT;
  }
  get corsOrigin(): string {
    return this.envConfig.FRONTEND_URL;
  }

  get bcryptSaltRounds(): number {
    return this.envConfig.BCRYPT_SALT_ROUNDS;
  }

  get rateLimitTtl(): number {
    return this.envConfig.RATE_LIMIT_TTL;
  }

  get rateLimitMax(): number {
    return this.envConfig.RATE_LIMIT_MAX;
  }
}
