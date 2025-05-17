import { Module } from '@nestjs/common';
import { SendEmailService } from './send-email.service';
import { SendEmailController } from './send-email.controller';
import { SendEmailQueueService } from './job/send-email-queue/send-email-queue.service';
import { SendEmailConsumerService } from './job/send-email-consumer/send-email-consumer.service';
import { NodemailerModule } from '../nodemailer/nodemailer.module';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue({ name: 'SEND_EMAIL_QUEUE' }),
    NodemailerModule,
  ],
  controllers: [SendEmailController],
  providers: [
    SendEmailService,
    SendEmailQueueService,
    SendEmailConsumerService,
  ],
})
export class SendEmailModule {}
