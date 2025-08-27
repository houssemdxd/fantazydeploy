import { Test, TestingModule } from '@nestjs/testing';
import { ApiserviceController } from './apiservice.controller';

describe('ApiserviceController', () => {
  let controller: ApiserviceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ApiserviceController],
    }).compile();

    controller = module.get<ApiserviceController>(ApiserviceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
