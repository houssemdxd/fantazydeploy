import { Module } from '@nestjs/common';
import { JourneeService } from './journee.service';
import { JourneeController } from './journee.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Fixture, FixtureSchema } from 'src/fixture/entities/fixture.entity';
import { Team, TeamSchema } from 'src/team/entities/team.entity';
import { Round, RoundSchema } from 'src/round/entities/round.entity';
import { Journee, JourneeSchema } from './entities/journee.entity';

@Module({
   imports: [
     MongooseModule.forFeature([
 
 
       { name: Journee.name, schema: JourneeSchema },
       { name: Fixture.name, schema: FixtureSchema },
       { name: Team.name, schema: TeamSchema },
       { name: Round.name, schema: RoundSchema },
 
     ]),
   ],
  controllers: [JourneeController],
    exports: [MongooseModule], // ✅ export so others can inject JourneeModel

  providers: [JourneeService]
})
export class JourneeModule {}
