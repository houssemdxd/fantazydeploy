import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyTeamController } from './weekly-team.controller';
import { WeeklyTeamService } from './weekly-team.service';

describe('WeeklyTeamController', () => {
  let controller: WeeklyTeamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WeeklyTeamController],
      providers: [WeeklyTeamService],
    }).compile();

    controller = module.get<WeeklyTeamController>(WeeklyTeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
