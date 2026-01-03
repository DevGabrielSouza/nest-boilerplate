import { INestApplication, Injectable, ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';

import { NotFoundInterceptor } from 'apps/api/src/common/errors/interceptors/notfound.interceptor';
import { PrismaService } from 'apps/api/src/prisma/prisma.service';
import { UnauthorizedInterceptor } from 'apps/api/src/common/errors/interceptors/unauthorized.interceptor';
import { ConflictInterceptor } from 'apps/api/src/common/errors/interceptors/conflict.interceptor';
import { DatabaseInterceptor } from 'apps/api/src/common/errors/interceptors/database.interceptor';
import { ResponseInterceptor } from 'apps/api/src/common/interceptors/response.interceptor';
import { TenantContextInterceptor } from 'apps/api/src/common/interceptors/tenant-context.interceptor';
import { AppConfigService } from '@env-config/config.service';
import logger from '@nc/logger';

@Injectable()
export class AppBootstrapService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: AppConfigService
  ) {}

  async configure(app: INestApplication): Promise<void> {
    logger.info('🔧 Configurando middlewares e interceptors');

    app.use(cookieParser());

    app.enableCors({
      origin: this.config.corsOrigin ?? 'http://localhost:3000',
      credentials: true,
    });

    app.useGlobalInterceptors(
      new TenantContextInterceptor(),
      new NotFoundInterceptor(),
      new UnauthorizedInterceptor(),
      new ConflictInterceptor(),
      new DatabaseInterceptor(),
      new ResponseInterceptor()
    );

    app.useGlobalPipes(new ValidationPipe());

    await this.setupShutdownHooks(app);
  }

  private async setupShutdownHooks(app: INestApplication): Promise<void> {
    await this.prisma.enableShutdownHooks(app);

    const shutdown = async (signal: string) => {
      logger.warn(`📴 Received shutdown signal: ${signal}`);
      await app.close();
      logger.info('✅ Application closed gracefully');
      process.exit(0);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  }
}
