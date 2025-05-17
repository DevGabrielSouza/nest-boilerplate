import { PrismaClientError } from '../types/PrismaClientError';

export const isPrismaError = (error: unknown): error is PrismaClientError => {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  const err = error as { [key: string]: unknown };
  return (
    typeof err.code === 'string' &&
    typeof err.clientVersion === 'string' &&
    (typeof err.meta === 'undefined' || typeof err.meta === 'object')
  );
};
