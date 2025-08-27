import { Test, TestingModule } from '@nestjs/testing';
import { FutureFixtureController } from './future-fixture.controller';
import { FutureFixtureService } from './future-fixture.service';

describe('FutureFixtureController', () => {
  let controller: FutureFixtureController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FutureFixtureController],
      providers: [FutureFixtureService],
    }).compile();

    controller = module.get<FutureFixtureController>(FutureFixtureController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
