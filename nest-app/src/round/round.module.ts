import { Module } from '@nestjs/common';
import { RoundService } from './round.service';
import { RoundController } from './round.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Round, RoundSchema } from './entities/round.entity';

@Module({


  
 imports: [
    MongooseModule.forFeature([{ name: Round.name, schema: RoundSchema }]),
  ],

  exports: [RoundService], // <-- must export it so other modules can use it

  controllers: [RoundController],
  providers: [RoundService]
})
export class RoundModule {}
