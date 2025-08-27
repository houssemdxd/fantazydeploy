import { Test, TestingModule } from '@nestjs/testing';
import { WeeklyTeamService } from './weekly-team.service';

describe('WeeklyTeamService', () => {
  let service: WeeklyTeamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WeeklyTeamService],
    }).compile();

    service = module.get<WeeklyTeamService>(WeeklyTeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
