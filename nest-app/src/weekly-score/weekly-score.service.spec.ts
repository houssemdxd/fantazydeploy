import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyScoreService } from './weekly-score.service';

describe('WeeklyScoreService', () => {
  let service: WeeklyScoreService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeeklyScoreService],
    }).compile();

    service = module.get<WeeklyScoreService>(WeeklyScoreService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
