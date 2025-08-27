import { Module } from '@nestjs/common';
import { PlayerStatsService } from './player-stats.service';
import { PlayerStatsController } from './player-stats.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerStatSchema } from './entities/player-stat.entity';
import { RoundSchema } from 'src/round/entities/round.entity';
import { FixtureSchema } from 'src/fixture/entities/fixture.entity';
import { WeeklyTeamSchema } from 'src/weekly-team/entities/weekly-team.entity';
import { TeamSchema } from 'src/team/entities/team.entity';
import { PlayerSchema } from 'src/player/entities/player.entity';

@Module({

imports: [
    MongooseModule.forFeature([{ name: 'PlayerStat', schema: PlayerStatSchema },    
        { name: 'Fixture', schema: FixtureSchema },
        { name: 'Team', schema: TeamSchema }, // 👈 add this line
        { name: 'Round', schema: RoundSchema }, // 👈 add this line
        { name: 'WeeklyTeam', schema: WeeklyTeamSchema }, 
    { name: 'Player', schema: PlayerSchema },

]),
  ],

  controllers: [PlayerStatsController],
  providers: [PlayerStatsService],
  exports:[PlayerStatsService,MongooseModule]
})
export class PlayerStatsModule {}
