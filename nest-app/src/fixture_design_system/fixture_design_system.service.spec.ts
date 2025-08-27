import { Test, TestingModule } from '@nestjs/testing';
import { FixtureDesignSystemService } from './fixture_design_system.service';

describe('FixtureDesignSystemService', () => {
  let service: FixtureDesignSystemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FixtureDesignSystemService],
    }).compile();

    service = module.get<FixtureDesignSystemService>(FixtureDesignSystemService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
