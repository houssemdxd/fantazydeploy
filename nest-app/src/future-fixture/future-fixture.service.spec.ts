import { Test, TestingModule } from '@nestjs/testing';
import { FutureFixtureService } from './future-fixture.service';

describe('FutureFixtureService', () => {
  let service: FutureFixtureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FutureFixtureService],
    }).compile();

    service = module.get<FutureFixtureService>(FutureFixtureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
