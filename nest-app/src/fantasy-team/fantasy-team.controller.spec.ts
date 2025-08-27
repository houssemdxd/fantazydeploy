import { Test, TestingModule } from '@nestjs/testing';
import { FantasyTeamController } from './fantasy-team.controller';
import { FantasyTeamService } from './fantasy-team.service';

describe('FantasyTeamController', () => {
  let controller: FantasyTeamController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FantasyTeamController],
      providers: [FantasyTeamService],
    }).compile();

    controller = module.get<FantasyTeamController>(FantasyTeamController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
