import { ConflictError } from './ConflictError';
import { PrismaClientError } from './PrismaClientError';

export class ForeignKeyConstraintError extends ConflictError {
  constructor(error: PrismaClientError) {
    const fieldName =
      error.meta && typeof error.meta === 'object' && 'field_name' in error.meta
        ? (error.meta.field_name as string)
        : 'unknown';
    super(`Provided ${fieldName} does not exist.`);
  }
}
