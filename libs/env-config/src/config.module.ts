import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppConfigService } from './config.service';
import { envSchema } from './env.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Configura o ConfigModule como global
      load: [
        () => {
          const parsed = envSchema.safeParse(process.env);
          if (!parsed.success) {
            console.error(
              'Invalid environment variables',
              parsed.error.format()
            );
            throw new Error('Invalid environment variables');
          }
          return { envConfig: parsed.data };
        },
      ],
    }),
  ],
  providers: [AppConfigService],
  exports: [AppConfigService], // Exporta o AppConfigService
})
export class AppConfigModule {}
