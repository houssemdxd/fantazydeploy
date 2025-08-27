import { Module } from '@nestjs/common';
import { FixtureDesignSystemService } from './fixture_design_system.service';
import { MongooseModule } from '@nestjs/mongoose';
import { FutureFixture, FutureFixtureSchema } from 'src/future-fixture/entities/future-fixture.entity';
import { Journee, JourneeSchema } from 'src/journee/entities/journee.entity';
import { Fixture, FixtureSchema } from 'src/fixture/entities/fixture.entity';
import { Team, TeamSchema } from 'src/team/entities/team.entity';
import { Round, RoundSchema } from 'src/round/entities/round.entity';
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


  providers: [FixtureDesignSystemService]
})
export class FixtureDesignSystemModule {}
