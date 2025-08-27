import { Test, TestingModule } from '@nestjs/testing';
import { JourneeService } from './journee.service';

describe('JourneeService', () => {
  let service: JourneeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [JourneeService],
    }).compile();

    service = module.get<JourneeService>(JourneeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
