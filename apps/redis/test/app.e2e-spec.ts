import { Test, TestingModule } from '@nestjs/testing';
import { RedisModule } from './../src/redis.module';

describe('RedisModule (e2e)', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [RedisModule],
    }).compile();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  afterEach(async () => {
    if (module) {
      await module.close();
    }
  });
});
