import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

type MockPrismaService = {
  $connect: jest.Mock;
  $disconnect: jest.Mock;
  $extends: jest.Mock;
  enableShutdownHooks: jest.Mock;
  onModuleDestroy: jest.Mock;
};

const mockPrismaService: MockPrismaService = {
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $extends: jest.fn(),
  enableShutdownHooks: jest.fn(),
  onModuleDestroy: jest.fn(),
};

mockPrismaService.$extends.mockReturnValue(mockPrismaService);

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    if (app) {
      await app.close();
    }
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
