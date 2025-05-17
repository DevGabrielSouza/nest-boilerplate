import { ConflictError } from './ConflictError';
import { PrismaClientError } from './PrismaClientError';

export class UniqueConstraintError extends ConflictError {
  constructor(error: PrismaClientError) {
    const { target, modelName } = error.meta;
    super(`A ${modelName} with ${target} already exists.`);
  }
}
