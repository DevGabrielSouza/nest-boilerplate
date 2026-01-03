import { ConflictError } from './ConflictError';
import { PrismaClientError } from './PrismaClientError';

export class UniqueConstraintError extends ConflictError {
  constructor(error: PrismaClientError) {
    const meta = error.meta && typeof error.meta === 'object' ? error.meta : {};
    const target = 'target' in meta ? (meta.target as string) : 'unknown';
    const modelName =
      'modelName' in meta ? (meta.modelName as string) : 'unknown';
    super(`A ${modelName} with ${target} already exists.`);
  }
}
