import { z } from 'zod';

export const envSchema = z.object({
  APP_PORT: z.string().transform((port) => parseInt(port, 10)),
  NODE_ENV: z.enum(['development', 'production', 'test']),
  JWT_SECRET: z.string(),
  JWT_EXPIRES_IN: z.string(),
  FRONTEND_URL: z.string().url(),
  DOMAIN_NAME: z.string(),
  FRONTEND_LOGIN_CALLBACK_ENDPOINT: z.string(),

  DB_HOST: z.string(),
  DB_PORT: z.string().transform((port) => parseInt(port, 10)),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DATABASE_URL: z.string().url(),

  REDIS_HOST: z.string(),
  REDIS_PORT: z.string().transform((port) => parseInt(port, 10)),
});

export type EnvConfig = z.infer<typeof envSchema>;
