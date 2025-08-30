import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as moment from 'moment-timezone';
import { Model } from 'mongoose';
import { ApiserviceService } from 'src/apiservice/apiservice.service';
import { Fixture } from 'src/fixture/entities/fixture.entity';
import { FutureFixture } from 'src/future-fixture/entities/future-fixture.entity';
import { Journee } from 'src/journee/entities/journee.entity';
import { Round } from 'src/round/entities/round.entity';
import { Team } from 'src/team/entities/team.entity';

@Injectable()
export class FixtureDesignSystemService implements OnApplicationBootstrap {
readonly logger = new Logger(FixtureDesignSystemService.name);

  constructor(
       private readonly apiService: ApiserviceService, // inject here
   @InjectModel('Fixture') private readonly fixtureModel: Model<Fixture>,
   @InjectModel('Team') private readonly teamModel: Model<Team>,
   @InjectModel('Round') private readonly roundModel: Model<Round>,
   @InjectModel('Journee') private readonly journeeModel: Model<Journee>,
   @InjectModel('FutureFixture') private readonly FutureFixtureModel: Model<FutureFixture>
  ) {}

  // ⚡ Cron job: every 2 hours
  @Cron('0 0 */23 * * *')
  async handleCron() {
    this.logger.log('Running syncFixtures via Cron...');
    await this.syncFixtures();
  }

  // ⚡ Run once on server startup
  async onApplicationBootstrap() {
    this.logger.log('Running syncFixtures on server start...');
    await this.syncFixtures();
  }


// ✅ Corrected syncFixtures with timezone handling
// syncFixtures(): parse API date/time as Africa/Tunis and store absolute UTC
async syncFixtures() {
  const data = await this.getSampleFixturesResponse();
  const groupedFixtures: Record<number, any[]> = {};

  // 1️⃣ Group fixtures by round
  for (const item of data.result) {
    const roundNumber = parseInt(item.league_round.match(/\d+/)?.[0] || '0', 10);

    let [hour, minute] = item.event_time.split(':');
    if (!minute) minute = '00';
    if (minute.length === 1) minute = minute.padStart(2, '0');
    if (hour.length === 1) hour = hour.padStart(2, '0');

    const fixtureDate = new Date(`${item.event_date}T${hour}:${minute}:00`);

    if (!groupedFixtures[roundNumber]) groupedFixtures[roundNumber] = [];
    groupedFixtures[roundNumber].push({
      fixtureId: item.event_key,
      date: fixtureDate,
      homeTeam: item.home_team_key,
      awayTeam: item.away_team_key,
    });
  }

  const sortedRounds = Object.keys(groupedFixtures)
    .map(Number)
    .sort((a, b) => a - b);

  let firstJourneeCreated = false;

  for (const roundNumber of sortedRounds) {
    const fixtures = groupedFixtures[roundNumber];
    let journee = await this.journeeModel.findOne({ round: roundNumber });

    let startDate: Date;

    if (!firstJourneeCreated) {
      // First journee = now + 2 min
      startDate = new Date();
      startDate.setMinutes(startDate.getMinutes() + 2);
      firstJourneeCreated = true;
    } else {
      const prevRoundNumber = roundNumber - 1;
      let lastPrevFixtureDate: Date | null = null;

      if (groupedFixtures[prevRoundNumber]?.length) {
        lastPrevFixtureDate = groupedFixtures[prevRoundNumber].reduce(
          (max, f) => (f.date > max ? f.date : max),
          groupedFixtures[prevRoundNumber][0].date
        );
      } else {
        const prevJournee = await this.journeeModel.findOne({ round: prevRoundNumber });
        if (prevJournee) {
          const lastPrevFixture = await this.FutureFixtureModel.findOne({
            journee: prevJournee._id,
          })
            .sort({ date: -1 })
            .exec();
          if (lastPrevFixture) lastPrevFixtureDate = lastPrevFixture.date;
        }
      }

      startDate = lastPrevFixtureDate
        ? new Date(lastPrevFixtureDate.getTime() + 2.5 * 60 * 60000)
        : fixtures[0].date;
    }

    // Deadline = first fixture - 5 minutes
    const firstFixtureDate = fixtures.reduce(
      (min, f) => (f.date < min ? f.date : min),
      fixtures[0].date
    );
    const deadline = new Date(firstFixtureDate.getTime() - 5 * 60000);

    this.logger.log(`Deadline for round ${roundNumber}: ${deadline}`);

    // Create or update journee
    if (!journee) {
      journee = new this.journeeModel({ round: roundNumber, date: startDate });
    } else {
      journee.date = startDate;
    }
    await journee.save();

    // Upsert fixtures
    for (const fix of fixtures) {
      const homeTeam = await this.teamModel.findOne({ team_id: fix.homeTeam });
      const awayTeam = await this.teamModel.findOne({ team_id: fix.awayTeam });
      if (!homeTeam || !awayTeam) continue;

      await this.FutureFixtureModel.updateOne(
        { homeKey: homeTeam._id, awayKey: awayTeam._id, date: fix.date },
        {
          $set: {
            homeKey: homeTeam._id,
            awayKey: awayTeam._id,
            date: fix.date,
            journee: journee._id,
          },
        },
        { upsert: true }
      );
    }
  }

  this.logger.log('✅ Fixtures & Journees synced successfully.');
}

  // Dummy function for sample data
 
 async getSampleFixturesResponse() {
  

     const startDate = new Date();

const today = new Date();
startDate.setDate(today.getDate() - 3);
  const startDateStr = startDate.toISOString().split('T')[0];
const todayStr = today.toISOString().split('T')[0];
const countryId=110
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);
const nextWeekStr = nextWeek.toISOString().split('T')[0];
    
 return await this.apiService.getFixtures(startDateStr, nextWeekStr, countryId);


 }


}
