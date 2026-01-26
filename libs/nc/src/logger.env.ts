import { z } from 'zod';

export const loggerEnvSchema = z.object({
  LOG_LEVEL: z.string().default('info'),
  NODE_ENV: z.string().default('development'),
});
