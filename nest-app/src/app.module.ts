import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RolesModule } from './roles/roles.module';
import { PlayerModule } from './player/player.module';
import { TeamModule } from './team/team.module';
import config from './config/config';
import { Team, TeamSchema } from './team/entities/team.entity';
import { Player, PlayerSchema } from './player/entities/player.entity';
import { FantasyTeamModule } from './fantasy-team/fantasy-team.module';
import { FixtureModule } from './fixture/fixture.module';
import { RoundModule } from './round/round.module';
import { WeeklyTeamModule } from './weekly-team/weekly-team.module';
import { PlayerStatsModule } from './player-stats/player-stats.module';
import { WeeklyScoreModule } from './weekly-score/weekly-score.module';
import { RoundSchedulerService } from './round-scheduler/round-scheduler.service';
import { ScheduleModule } from '@nestjs/schedule';
import { RoundSchedulerModule } from './round-scheduler/RoundSchedulerModule';
import { JourneeModule } from './journee/journee.module';
import { FutureFixtureModule } from './future-fixture/future-fixture.module';
import { FixtureDesignSystemModule } from './fixture_design_system/fixture_design_system.module';
import { ApiserviceService } from './apiservice/apiservice.service';
import { ApiserviceModule } from './apiservice/apiservice.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      load: [config],
    }),
    ScheduleModule.forRoot(),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        secret: config.get('jwt.secret'),
      }),
      global: true,
      inject: [ConfigService],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (config) => ({
        uri: config.get('database.connectionString'),
      }),
      inject: [ConfigService],
    }),
     MongooseModule.forFeature([
      { name: Team.name, schema: TeamSchema },
      { name: Player.name, schema: PlayerSchema }
    ]),
    AuthModule,
    RolesModule,
    PlayerModule,
    TeamModule,
    FantasyTeamModule,
    FixtureModule,
    RoundModule,
    WeeklyTeamModule,
    PlayerStatsModule,
    WeeklyScoreModule,
    RoundSchedulerModule,
    JourneeModule,
    FutureFixtureModule,
    FixtureDesignSystemModule,
    ApiserviceModule
  ],
  controllers: [AppController],
  providers: [AppService, RoundSchedulerService],
})
export class AppModule {}
