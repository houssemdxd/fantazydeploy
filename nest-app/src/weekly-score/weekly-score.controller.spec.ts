import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyScoreController } from './weekly-score.controller';
import { WeeklyScoreService } from './weekly-score.service';

describe('WeeklyScoreController', () => {
  let controller: WeeklyScoreController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeklyScoreController],
      providers: [WeeklyScoreService],
    }).compile();

    controller = module.get<WeeklyScoreController>(WeeklyScoreController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
