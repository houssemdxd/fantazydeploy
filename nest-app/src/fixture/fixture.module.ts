import { Module } from '@nestjs/common';
import { FixtureService } from './fixture.service';
import { FixtureController } from './fixture.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Fixture, FixtureSchema } from './entities/fixture.entity';
import { Team, TeamSchema } from 'src/team/entities/team.entity';
import { Round, RoundSchema } from 'src/round/entities/round.entity';
import { FutureFixture, FutureFixtureSchema } from 'src/future-fixture/entities/future-fixture.entity';
import { Journee, JourneeSchema } from 'src/journee/entities/journee.entity';
import { ApiserviceModule } from 'src/apiservice/apiservice.module';

@Module({
   imports: [ApiserviceModule,
    MongooseModule.forFeature([


        { name: FutureFixture.name, schema: FutureFixtureSchema },
      { name: Journee.name, schema: JourneeSchema },

      { name: Fixture.name, schema: FixtureSchema },
      { name: Team.name, schema: TeamSchema },
      { name: Round.name, schema: RoundSchema },

    ]),
  ],
  controllers: [FixtureController],
  providers: [FixtureService],
  exports: [FixtureService], // 👈 Needed to use in other modules

})
export class FixtureModule {}
