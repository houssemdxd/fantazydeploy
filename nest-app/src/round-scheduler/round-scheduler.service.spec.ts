import { Test, TestingModule } from '@nestjs/testing';
import { RoundSchedulerService } from './round-scheduler.service';

describe('RoundSchedulerService', () => {
  let service: RoundSchedulerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoundSchedulerService],
    }).compile();

    service = module.get<RoundSchedulerService>(RoundSchedulerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
