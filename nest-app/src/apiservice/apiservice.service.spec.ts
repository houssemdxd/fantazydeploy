import { Test, TestingModule } from '@nestjs/testing';
import { ApiserviceService } from './apiservice.service';

describe('ApiserviceService', () => {
  let service: ApiserviceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ApiserviceService],
    }).compile();

    service = module.get<ApiserviceService>(ApiserviceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
