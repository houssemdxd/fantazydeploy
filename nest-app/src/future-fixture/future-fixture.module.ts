import { Module } from '@nestjs/common';
import { FutureFixtureService } from './future-fixture.service';
import { FutureFixtureController } from './future-fixture.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { FixtureSchema } from 'src/fixture/entities/fixture.entity';
import { TeamSchema } from 'src/team/entities/team.entity';
import { RoundSchema } from 'src/round/entities/round.entity';
import { WeeklyTeamSchema } from 'src/weekly-team/entities/weekly-team.entity';
import { PlayerSchema } from 'src/player/entities/player.entity';
import { FutureFixtureSchema } from './entities/future-fixture.entity';

@Module({
   
    imports: [
        MongooseModule.forFeature([,    
            { name: 'Fixture', schema: FixtureSchema },
            { name: 'Team', schema: TeamSchema }, // 👈 add this line
            { name: 'Round', schema: RoundSchema }, // 👈 add this line
            { name: 'WeeklyTeam', schema: WeeklyTeamSchema }, 
             { name: 'Player', schema: PlayerSchema },
                { name: 'FutureFixture', schema: FutureFixtureSchema },
    
    ]),],
  controllers: [FutureFixtureController],
  providers: [FutureFixtureService]
})
export class FutureFixtureModule {}
