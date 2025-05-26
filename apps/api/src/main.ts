import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from '../../../libs/env-config/src/config.service';
import { AppBootstrapService } from './core/application/service/app-bootstrap.service';
import logger from '@nc/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const bootstrapService = app.get(AppBootstrapService);
  await bootstrapService.configure(app);

  const config = app.get(AppConfigService);
  await app.listen(config.port, '0.0.0.0');
  logger.info(`🚀 App listening on port ${config.port}`);
}
bootstrap();
