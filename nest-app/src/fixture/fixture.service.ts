import { Injectable } from '@nestjs/common';
import { CreateFixtureDto } from './dto/create-fixture.dto';
import { UpdateFixtureDto } from './dto/update-fixture.dto';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Fixture } from './entities/fixture.entity';
import { Team } from 'src/team/entities/team.entity';
import { Round } from 'src/round/entities/round.entity';
import { AnyARecord } from 'dns';
import { FutureFixture } from 'src/future-fixture/entities/future-fixture.entity';
import { Journee } from 'src/journee/entities/journee.entity';
import { ApiserviceService } from 'src/apiservice/apiservice.service';

@Injectable()
export class FixtureService {

constructor(
         private readonly apiService: ApiserviceService, // inject here

@InjectModel('Fixture') private readonly fixtureModel: Model<Fixture>,
@InjectModel('Team') private readonly teamModel: Model<Team>,
@InjectModel('Round') private readonly roundModel: Model<Round>,
@InjectModel('Journee') private readonly journeeModel: Model<Journee>,
@InjectModel('FutureFixture') private readonly FutureFixtureModel: Model<FutureFixture>,
  ) {}


  create(createFixtureDto: CreateFixtureDto) {
    return 'This action adds a new fixture';
  }

  findAll() {
    return `This action returns all fixture`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fixture`;
  }

  update(id: number, updateFixtureDto: UpdateFixtureDto) {
    return `This action updates a #${id} fixture`;
  }

  remove(id: number) {
    return `This action removes a #${id} fixture`;
  }


async getSimplifiedFixtures(journeeRoundNumber: number) {
  const response = await this.getSampleFixturesResponse();
  console.log(response)
  // Filter fixtures for this specific round
  return response.result
    .filter(fixture => {
      // Extract number from "Round 3" string
      const roundNumber = parseInt(fixture.league_round.replace('Round ', ''), 10);
      return roundNumber === journeeRoundNumber;
    })
    .map(fixture => ({
      homeTeam: fixture.event_home_team,
      homeTeamKey: fixture.home_team_key,
      awayTeam: fixture.event_away_team,
      awayTeamKey: fixture.away_team_key,
      eventTime: fixture.event_time,
      date: fixture.event_date,
      league: fixture.league_name,
      event_status: fixture.event_status,
    }));
}

async createFixturesFromApi(journeeRoundNumber: number): Promise<any[]> {
  const fixtures = await this.getSimplifiedFixtures(journeeRoundNumber);
  const latestRound = await this.roundModel.findOne().sort({ roundNumber: -1 });
  if (!latestRound) return [];

  const savedFixtures = [];

  for (const f of fixtures) {
    const homeTeam = await this.teamModel.findOne({ team_id: f.homeTeamKey });
    const awayTeam = await this.teamModel.findOne({ team_id: f.awayTeamKey });
    if (!homeTeam || !awayTeam) continue;

    // 🔹 check if this fixture already exists
    let fixtureDoc = await this.fixtureModel.findOne({
      homeTeam: homeTeam._id,
      awayTeam: awayTeam._id,
      date: f.date,
      eventTime: f.eventTime,
      round: latestRound._id,
    });

    if (!fixtureDoc) {
      fixtureDoc = new this.fixtureModel({
        homeTeam: homeTeam._id,
        awayTeam: awayTeam._id,
        eventTime: f.eventTime,
        date: f.date,
        league: f.league,
        event_status: f.event_status,
        round: latestRound._id,
        // 🚫 no matchId anymore
      });
      await fixtureDoc.save();
    }

    savedFixtures.push(fixtureDoc);
  }

  return savedFixtures;
}

 async getSampleFixturesResponse() {

const today = new Date();
const todayStr = today.toISOString().split('T')[0];
const countryId=110
const nextWeek = new Date();
nextWeek.setDate(today.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];
 return await this.apiService.getFixtures(todayStr, nextWeekStr, countryId);


 }
async updateFixtureMachSofaNumber(roundId: number) {
  // 1. Get all fixtures of the last round
  const fixtures = await this.getFixturesOfLastRound();

  // 2. Get matches from the Flask API
  const matchesData = await this.apiService.getMatchesByRoundSofa(roundId);
for (const fixture of fixtures) {
  const homeTeam = await this.teamModel.findById(fixture.homeTeam).exec();
  const awayTeam = await this.teamModel.findById(fixture.awayTeam).exec();

  const matchFromApi = matchesData.find(match =>
    (match.home_team_code === homeTeam.team_sofa_id &&
     match.away_team_code === awayTeam.team_sofa_id) ||
    (match.home_team_code === awayTeam.team_sofa_id &&
     match.away_team_code === homeTeam.team_sofa_id)
  );

  if (matchFromApi) {
    await this.fixtureModel.updateOne(
      { _id: fixture._id },
      { $set: { sofamatchId: matchFromApi.match_id } }
    );
    console.log(`Updated fixture ${fixture._id} with SofaScore match ID: ${matchFromApi.match_id}`);
  }
}


  console.log("Finished updating all fixtures.");
}








async getFixturesOfLastRound() {
  // 1️⃣ Get the round with the highest roundNumber
  const latestRound = await this.roundModel.findOne().sort({ roundNumber: -1 }).exec();
  if (!latestRound) {
    console.log('No round found. Please create a round before adding fixtures.');
    return [];
  }

  // 2️⃣ Find all fixtures linked to that round
  const fixtures = await this.fixtureModel.find({ round: latestRound._id }).exec();

  return fixtures;
}




 }

