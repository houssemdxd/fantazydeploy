import { Test, TestingModule } from '@nestjs/testing';
import { FantasyTeamService } from './fantasy-team.service';

describe('FantasyTeamService', () => {
  let service: FantasyTeamService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FantasyTeamService],
    }).compile();

    service = module.get<FantasyTeamService>(FantasyTeamService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
