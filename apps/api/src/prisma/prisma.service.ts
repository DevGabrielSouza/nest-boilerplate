import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
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

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
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

  async enableShutdownHooks(app: INestApplication) {
    app.enableShutdownHooks();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
