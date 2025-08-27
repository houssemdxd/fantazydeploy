import { Test, TestingModule } from '@nestjs/testing';
import { FixtureController } from './fixture.controller';
import { FixtureService } from './fixture.service';

describe('FixtureController', () => {
  let controller: FixtureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FixtureController],
      providers: [FixtureService],
    }).compile();

    controller = module.get<FixtureController>(FixtureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
