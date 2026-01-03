import { z } from 'zod';

export const envSchema = z.object({
  APP_PORT: z.string().transform((port) => parseInt(port, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  FRONTEND_URL: z.string().url(),
  DOMAIN_NAME: z.string(),

  DB_HOST: z.string(),
  DB_PORT: z.string().transform((port) => parseInt(port, 10)),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DATABASE_URL: z.string().url(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform((port) => parseInt(port, 10)),

  BCRYPT_SALT_ROUNDS: z
    .string()
    .default('12')
    .transform((rounds) => parseInt(rounds, 10)),

  RATE_LIMIT_TTL: z
    .string()
    .default('60')
    .transform((ttl) => parseInt(ttl, 10)),

  RATE_LIMIT_MAX: z
    .string()
    .default('10')
    .transform((max) => parseInt(max, 10)),
});

export type EnvConfig = z.infer<typeof envSchema>;
