import { Module } from '@nestjs/common';
import { ApiserviceController } from './apiservice.controller';
import { ApiserviceService } from './apiservice.service';
import { HttpModule } from '@nestjs/axios';

@Module({
   imports: [HttpModule],  // ✅ provides HttpService
  controllers: [ApiserviceController],
  providers: [ApiserviceService],
  exports: [ApiserviceService], // ✅ optional if you want to use service outside  // optional, if you want to use it in other modules
})
export class ApiserviceModule {}
