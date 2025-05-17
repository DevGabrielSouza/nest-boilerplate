import { DatabaseError } from '../types/DatabaseError';
import { ForeignKeyConstraintError } from '../types/ForeignKeyConstraintError';
import { NotFoundError } from '../types/NotFoundError';
import { PrismaClientError } from '../types/PrismaClientError';
import { UniqueConstraintError } from '../types/UniqueConstraintError';

enum PrismaErrors {
  UniqueConstraintViolation = 'P2002',
  ForeignKeyConstraintViolation = 'P2003',
  RecordDoesNotExist = 'P2025',
}

export const handleDatabaseErrors = (error: PrismaClientError): Error => {
  switch (error.code) {
    case PrismaErrors.UniqueConstraintViolation:
      return new UniqueConstraintError(error);
    case PrismaErrors.ForeignKeyConstraintViolation:
      return new ForeignKeyConstraintError(error);
    case PrismaErrors.RecordDoesNotExist:
      return new NotFoundError();
    default:
      return new DatabaseError(error.message);
  }
};
