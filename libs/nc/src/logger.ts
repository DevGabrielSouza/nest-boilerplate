import pino from 'pino';
import { ConfigService } from '@nestjs/config';
import { envSchema } from '@env-config/env.schema';

type Logger = {
  info: (...args: unknown[]) => void;
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
  debug: (...args: unknown[]) => void;
  trace: (...args: unknown[]) => void;
  fatal: (...args: unknown[]) => void;
};

const isTest = process.env.NODE_ENV === 'test';

let logger: Logger;

if (isTest) {
  const noop = () => undefined;

  logger = {
    info: noop,
    error: noop,
    warn: noop,
    debug: noop,
    trace: noop,
    fatal: noop,
  };
} else {
  const parsedEnv = envSchema.parse(process.env);
  const configService = new ConfigService(parsedEnv);

  logger = pino({
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
}

export default logger;
