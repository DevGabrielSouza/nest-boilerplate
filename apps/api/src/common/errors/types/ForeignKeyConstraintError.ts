import { ConflictError } from './ConflictError';
import { PrismaClientError } from './PrismaClientError';

export class ForeignKeyConstraintError extends ConflictError {
  constructor(error: PrismaClientError) {
    const { field_name } = error.meta;
    super(`Provided ${field_name} does not exist.`);
  }
}
