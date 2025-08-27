import { Module } from '@nestjs/common';
import { PlayerService } from './player.service';
import { PlayerController } from './player.controller';
import { PlayerSchema } from './entities/player.entity';
import { MongooseModule } from '@nestjs/mongoose';

@Module({

 imports: [
    MongooseModule.forFeature([{ name: 'Player', schema: PlayerSchema }])
  ],

  controllers: [PlayerController],
  providers: [PlayerService]
})
export class PlayerModule {}
