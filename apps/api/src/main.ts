import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppConfigService } from '../../../libs/env-config/src/config.service';
import { AppBootstrapService } from './core/application/service/app-bootstrap.service';
import { Password } from './shared/domain/value-objects/password';
import logger from '@nc/logger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  const configService = app.get(AppConfigService);
  Password.setConfigService(configService);

  const bootstrapService = app.get(AppBootstrapService);
  await bootstrapService.configure(app);

  await app.listen(configService.port, '0.0.0.0');
  logger.info(`🚀 App listening on port ${configService.port}`);
}
bootstrap();
