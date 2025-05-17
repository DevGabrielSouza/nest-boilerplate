import {
  OnQueueActive,
  OnQueueCompleted,
  OnQueueFailed,
  Process,
  Processor,
} from '@nestjs/bull';
import { NodemailerService } from 'apps/redis/src/nodemailer/nodemailer.service';

import { Job } from 'bull';

type SendEmailConsumer = {
  name: string;
  email: string;
  subject: string;
  text: string;
  html?: string;
};

@Processor('SEND_EMAIL_QUEUE')
export class SendEmailConsumerService {
  constructor(private readonly nodemailerService: NodemailerService) {}
  @Process('SEND_EMAIL_QUEUE')
  async execute({ data }: Job<SendEmailConsumer>) {
    const { email, name, subject, text, html } = data;
    await this.nodemailerService.sendEmail({
      email,
      name,
      subject,
      text,
      html,
    });
  }

  @OnQueueActive()
  onActive(job: Job<SendEmailConsumer>) {
    console.log(`Processing job ${job.id} of type ${job.name}`);
  }

  @OnQueueFailed()
  async onQueueFailed(job: Job<SendEmailConsumer>, err: Error) {
    console.log(`Job ${job.id} failed with ${err.message}`);
  }

  @OnQueueCompleted()
  async onQueueCompleted(job: Job<SendEmailConsumer>) {
    console.log(`Job ${job.id} completed`);
  }
}
