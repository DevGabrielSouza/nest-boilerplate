import { Module } from '@nestjs/common';
import { RequestContextService } from './application/service/request-context.service';

@Module({
  providers: [RequestContextService],
  exports: [RequestContextService],
})
export class RequestContextModule {}
