import { Module } from '@nestjs/common';
import { NodemailerService } from './nodemailer.service';
import { NodemailerProvider } from './nodemailer.provider';

@Module({
  providers: [NodemailerService, NodemailerProvider],
  exports: [NodemailerService, NodemailerProvider],
})
export class NodemailerModule {}
