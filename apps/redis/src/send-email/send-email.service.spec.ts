import { Test, TestingModule } from '@nestjs/testing';
import { SendEmailService } from './send-email.service';
import { SendEmailQueueService } from './job/send-email-queue/send-email-queue.service';

describe('SendEmailService', () => {
  let service: SendEmailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SendEmailService,
        {
          provide: SendEmailQueueService,
          useValue: {
            // Mock qualquer método necessário do SendEmailQueueService aqui
            addEmailToQueue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SendEmailService>(SendEmailService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
