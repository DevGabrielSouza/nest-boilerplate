import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { tenantFilterMiddleware } from './middlewares/tenant-filter.middleware';
import logger from '@nc/logger';

type PrismaAction =
  | 'findUnique'
  | 'findFirst'
  | 'findMany'
  | 'count'
  | 'aggregate'
  | 'groupBy'
  | 'update'
  | 'updateMany'
  | 'delete'
  | 'deleteMany'
  | 'create'
  | 'createMany'
  | 'findUniqueOrThrow'
  | 'findFirstOrThrow'
  | 'upsert';

function parseConnectionString(connectionString: string) {
  const url = new URL(connectionString);
  return {
    host: url.hostname,
    port: url.port ? parseInt(url.port, 10) : 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  };
}

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new Error('DATABASE_URL is not defined');
    }

    const config = parseConnectionString(databaseUrl);
    const adapter = new PrismaMariaDb({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
      database: config.database,
      connectionLimit: 5,
      allowPublicKeyRetrieval: true,
    });

    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();

    this.$extends({
      query: {
        $allModels: {
          async $allOperations({
            operation,
            model,
            args,
            query,
          }: {
            operation: string;
            model: string;
            args: Record<string, unknown>;
            query: (args: Record<string, unknown>) => Promise<unknown>;
          }) {
            const context = {
              model,
              action: operation as PrismaAction,
              args,
            };
            return tenantFilterMiddleware(context, () => query(args));
          },
        },
      },
    });

    logger.info('🔒 Prisma tenant filtering middleware ativado');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
