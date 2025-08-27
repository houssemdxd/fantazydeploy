// round-scheduler.module.ts
import { Module } from '@nestjs/common';
import { RoundSchedulerService } from './round-scheduler.service';
import { FixtureModule } from '../fixture/fixture.module'; // adjust path
import { RoundService } from 'src/round/round.service';
import { RoundModule } from 'src/round/round.module';
import { FantasyTeamModule } from 'src/fantasy-team/fantasy-team.module';
import { AuthModule } from 'src/auth/auth.module';
import { PlayerStatsModule } from 'src/player-stats/player-stats.module';
import { MongooseModule } from '@nestjs/mongoose';
import { PlayerStatSchema } from 'src/player-stats/entities/player-stat.entity';
import { FixtureSchema } from 'src/fixture/entities/fixture.entity';
import { TeamSchema } from 'src/team/entities/team.entity';
import { RoundSchema } from 'src/round/entities/round.entity';
import { WeeklyTeamSchema } from 'src/weekly-team/entities/weekly-team.entity';
import { PlayerSchema } from 'src/player/entities/player.entity';
import { JourneeSchema } from 'src/journee/entities/journee.entity';
import { ApiserviceModule } from 'src/apiservice/apiservice.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'PlayerStat', schema: PlayerStatSchema },    
            { name: 'Fixture', schema: FixtureSchema },
            { name: 'Team', schema: TeamSchema }, // 👈 add this line
            { name: 'Round', schema: RoundSchema }, // 👈 add this line
            { name: 'WeeklyTeam', schema: WeeklyTeamSchema }, 
        { name: 'Player', schema: PlayerSchema },
                { name: 'Journee', schema: JourneeSchema },

    
    ]),
    
    FixtureModule,RoundModule,FantasyTeamModule,AuthModule,PlayerStatsModule,ApiserviceModule], // ✅ import module that exports FixtureService
  providers: [RoundSchedulerService],
  exports: [RoundSchedulerService], // optional, if used elsewhere
})
export class RoundSchedulerModule {}
