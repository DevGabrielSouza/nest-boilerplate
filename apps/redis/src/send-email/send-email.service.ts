import { Injectable } from '@nestjs/common';
import { CreateSendEmailDto } from './domain/dto/create-send-email.dto';
import { SendEmailQueueService } from './job/send-email-queue/send-email-queue.service';

@Injectable()
export class SendEmailService {
  constructor(private readonly sendEmailQueueService: SendEmailQueueService) {}
  async sendEmail(createSendEmailDto: CreateSendEmailDto) {
    await this.sendEmailQueueService.addSendEmailJob(createSendEmailDto);
  }

  findAll() {
    return `This action returns all sendEmail`;
  }

  findOne(id: number) {
    return `This action returns a #${id} sendEmail`;
  }
}
