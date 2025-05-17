import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';

export type PrismaClientError = PrismaClientKnownRequestError & {
  meta?: { target: string; modelName: string; field_name: string };
};
