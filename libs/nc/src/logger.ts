import pino from 'pino';
import { ConfigService } from '@nestjs/config';
import { envSchema } from '@env-config/env.schema';

const configService = new ConfigService(envSchema.parse(process.env));

const logger = pino({
  level: configService.get<string>('LOG_LEVEL') || 'info',
  transport:
    configService.get<string>('NODE_ENV') !== 'production'
      ? {
          target: 'pino-pretty',
          options: {
            colorize: true,
            translateTime: 'SYS:standard',
            ignore: 'pid,hostname',
          },
        }
      : undefined,
  base: {
    pid: false,
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
