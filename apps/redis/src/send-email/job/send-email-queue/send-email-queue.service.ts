import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';
import { CreateSendEmailDto } from '../../domain/dto/create-send-email.dto';

@Injectable()
export class SendEmailQueueService {
  constructor(
    @InjectQueue('SEND_EMAIL_QUEUE') private readonly sendEmailQueue: Queue
  ) {}

  async addSendEmailJob(data: CreateSendEmailDto) {
    await this.sendEmailQueue.add('SEND_EMAIL_QUEUE', data);
  }
}
