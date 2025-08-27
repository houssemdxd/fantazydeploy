import { Module } from '@nestjs/common';
import { WeeklyScoreService } from './weekly-score.service';
import { WeeklyScoreController } from './weekly-score.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WeeklyScoreSchema } from './entities/weekly-score.entity';

@Module({


     imports: [
      MongooseModule.forFeature([
        
        { name: 'WeeklyScore', schema: WeeklyScoreSchema },    
         
  
  
  ]),
    ],
  controllers: [WeeklyScoreController],
  providers: [WeeklyScoreService]
})
export class WeeklyScoreModule {}
