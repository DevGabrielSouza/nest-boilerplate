import { INestApplication, Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { tenantFilterMiddleware } from './middlewares/tenant-filter.middleware';
import logger from '@nc/logger';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit() {
    await this.$connect();

    this.$use(tenantFilterMiddleware);

    logger.info('🔒 Prisma tenant filtering middleware ativado');
  }

  async enableShutdownHooks(app: INestApplication) {
    app.enableShutdownHooks();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
