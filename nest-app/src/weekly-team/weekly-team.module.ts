import { Module } from '@nestjs/common';
import { WeeklyTeamService } from './weekly-team.service';
import { WeeklyTeamController } from './weekly-team.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { WeeklyTeam, WeeklyTeamSchema } from './entities/weekly-team.entity';

@Module({

 imports: [
    MongooseModule.forFeature([
      { name: WeeklyTeam.name, schema: WeeklyTeamSchema },
    ]),
  ],

  controllers: [WeeklyTeamController],
  providers: [WeeklyTeamService]
})
export class WeeklyTeamModule {}
