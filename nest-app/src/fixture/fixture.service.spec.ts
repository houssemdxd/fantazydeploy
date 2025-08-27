import { Test, TestingModule } from '@nestjs/testing';
import { FixtureService } from './fixture.service';

describe('FixtureService', () => {
  let service: FixtureService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FixtureService],
    }).compile();

    service = module.get<FixtureService>(FixtureService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
