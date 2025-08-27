import { ConsoleLogger, Injectable } from '@nestjs/common';
import { CreateFantasyTeamDto } from './dto/create-fantasy-team.dto';
import { UpdateFantasyTeamDto } from './dto/update-fantasy-team.dto';
import { InjectModel } from '@nestjs/mongoose';
import { FlattenMaps, Model, Types } from 'mongoose';
import { FantasyTeam } from './entities/fantasy-team.entity';
import { Player } from 'src/player/entities/player.entity';
import { Fixture } from 'src/fixture/entities/fixture.entity';
import { Team } from 'src/team/entities/team.entity';
import { Round } from 'src/round/entities/round.entity';
import { WeeklyTeam } from 'src/weekly-team/entities/weekly-team.entity';
import { PlayerStat } from 'src/player-stats/entities/player-stat.entity';
import { WeeklyScore } from 'src/weekly-score/entities/weekly-score.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as qs from 'qs'; // To format form data
import { response } from 'express';
import { Journee } from 'src/journee/entities/journee.entity';
import { FutureFixture } from 'src/future-fixture/entities/future-fixture.entity';
import { ApiserviceService } from 'src/apiservice/apiservice.service';
@Injectable()
export class FantasyTeamService {


 constructor(
           private readonly apiService: ApiserviceService, // inject here
  
    private readonly httpService: HttpService,
       @InjectModel('Journee') private readonly journeeModel: Model<Journee>,
   @InjectModel('FutureFixture') private readonly FutureFixtureModel: Model<FutureFixture>,

    @InjectModel('FantasyTeam') private readonly fantasyTeamModel: Model<FantasyTeam>,
    @InjectModel('Fixture') private readonly fixtureModel: Model<Fixture>,
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    @InjectModel('Round') private readonly roundModel: Model<Round>,
@InjectModel(WeeklyTeam.name) private readonly weeklyTeamModel: Model<WeeklyTeam>,
    @InjectModel('Player') private readonly playerModel: Model<Player>,
        @InjectModel('PlayerStat') private readonly playerStatModel: Model<PlayerStat>,
        @InjectModel('WeeklyScore') private readonly WeeklyScoreModel: Model<WeeklyScore>,


    
  ) {}

// fixture.service.ts

async getFixturesWithPlayerStatsByRound(roundId: string) {
  // 1️⃣ Get all fixtures for this round
  const fixtures = await this.fixtureModel
    .find({ round: new Types.ObjectId(roundId) })
    .populate('homeTeam')
    .populate('awayTeam')
    .exec();

  const result = [];

  for (const fixture of fixtures) {
    // Get home & away players
    const homePlayers = await this.playerModel.find({ team_id: fixture.homeTeam._id }).exec();
    const awayPlayers = await this.playerModel.find({ team_id: fixture.awayTeam._id }).exec();

    // Stats for home players
    const homeStats = await this.playerStatModel
      .find({
        round_id: new Types.ObjectId(roundId),
        player_id: { $in: homePlayers.map(p => p._id) },
      })
      .exec();

    // Stats for away players
    const awayStats = await this.playerStatModel
      .find({
        round_id: new Types.ObjectId(roundId),
        player_id: { $in: awayPlayers.map(p => p._id) },
      })
      .exec();

    result.push({
      fixtureId: fixture._id,
      date: fixture.date,
      eventTime: fixture.eventTime,
      homeTeam: {
        id: fixture.homeTeam._id,
        name: fixture.homeTeam,
        players: homePlayers.map(player => {
          const stat = homeStats.find(s => s.player_id.toString() === player._id.toString());
           // console.log(stat)

          return {
            player_id: player._id,
            name: player.name,
            goals: stat?.goals || 0,
            yellowCard: stat?.yellowCard || false,
            redCard: stat?.redCard || false,
            substituted: stat?.substituted || false,
            score: stat?.score || 0,
            isPlayed:stat.isPlayed,
                        assist :stat.assist

          };
        }),
      },
      awayTeam: {
        id: fixture.awayTeam._id,
        name: fixture.awayTeam,
        players: awayPlayers.map(player => {
          const stat = awayStats.find(s => s.player_id.toString() === player._id.toString());
          return {
            player_id: player._id,
            name: player.name,
            goals: stat?.goals || 0,
            yellowCard: stat?.yellowCard || false,
            redCard: stat?.redCard || false,
            substituted: stat?.substituted || false,
            score: stat?.score || 0,
            isPlayed:stat.isPlayed,
            assist :stat.assist

          };
        }),
      },
    });
  }

  return result;
}





async getPlayerStatsByUser(userId: string) {
  // 1. Fetch all rounds sorted ascending by roundNumber
  const rounds = await this.roundModel.find().sort({ roundNumber: 1 }).lean();

  if (rounds.length === 0) {
    console.warn('No rounds found in DB');
    return [];
  }

  // Get the latest round (current round)
  const currentRound = rounds[rounds.length - 1];


  console.log("00000000000000000000000000000000000000000000000000000000000000"+currentRound._id)
  // 2. Fetch all weekly teams of the user, sorted by roundNumber ascending (populate round)
  const weeklyTeams = await this.weeklyTeamModel
    .find({ user_id: new Types.ObjectId(userId) })
    .populate('round')
    .sort({ 'round.roundNumber': 1 })
    .lean();

  if (weeklyTeams.length === 0) {
    console.warn('No weekly teams found for user:', userId);
    return [];
  }

  // 3. Create a map from roundNumber to weeklyTeam for quick lookup
  const weeklyTeamMap = new Map<number, any>();
  for (const team of weeklyTeams) {
    const roundObj = team.round as unknown as { _id: Types.ObjectId; roundNumber: number };
    if (roundObj?.roundNumber !== undefined) {
      weeklyTeamMap.set(roundObj.roundNumber, team);
    }
  }

  const results = [];

  let lastKnownTeam = null;

  // 4. Loop from round 1 to currentRound.roundNumber (all rounds)
  for (const round of rounds) {
    if (round.roundNumber > currentRound.roundNumber) break; // stop if round beyond currentRound

    // Update lastKnownTeam if user has a team for this round
    if (weeklyTeamMap.has(round.roundNumber)) {
      lastKnownTeam = weeklyTeamMap.get(round.roundNumber);
    }

    if (!lastKnownTeam) {
      // If no team at all so far, skip or push empty players
      results.push({
        round: round.roundNumber,
        players: [],
      });
      continue;
    }

    // 5. Get fantasy players for the last known team (for the round)
    const fantasyPlayers = await this.fantasyTeamModel
      .find({ WeeklyTeam: lastKnownTeam._id })
      .lean();

    // Extract player IDs
    const playerIds = fantasyPlayers.map(fp => fp.player_id);

    // 6. Fetch PlayerStats for these players but **for the current round** (important!)
    const playerStats = await this.playerStatModel
      .find({
        round_id: round._id,        // round_id matches current round's _id here
        player_id: { $in: playerIds },
      })
      .lean();

    // 7. Fetch player details for these player IDs
    const players = await this.playerModel
      .find({ _id: { $in: playerIds } })
      .lean();

    // 8. Merge player info with their score for this round
    const playersWithStats = players.map(player => {
      const stat = playerStats.find(ps => ps.player_id === player._id);
      return {
        _id: player._id,
        name: player.name,
        position: player.position,
        image: player.image,
        score: stat?.score ?? 0,
        assist : stat.assist
      };
    });

    // 9. Add to results
    results.push({
      round: round.roundNumber,
      players: playersWithStats,
    });
  }

  return results;
}
//------------------------------------------------------------------------------------------------------------------------
async  getLineup(match_id) {
  try {
    // Call your FastAPI lineup endpoint for this match
    const response = await fetch(`http://localhost:8000/lineup?match_id=${match_id}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch lineup for match ${match_id}: ${response.statusText}`);
    }

    const lineupData = await response.json();

    console.log(`Lineup data for match ${match_id}:`, lineupData);
    return lineupData;

  } catch (err) {
    console.error(`Error fetching lineup for match ${match_id}:`, err);
    return null;
  }
}
//----------------------------------------------------------------
async getCurrentJournee(): Promise<Journee | null> {
  const now = new Date();
  const allJournees = await this.journeeModel.find({}).sort({ round: 1 }).exec();
  //console.log(allJournees)
  for (let i = 0; i < allJournees.length; i++) {
    const journee = allJournees[i];
    const nextJournee = allJournees[i + 1];
    
    const journeeDate = new Date(journee.date);
    console.log("jouree date is "+journeeDate)
    const nextJourneeDate = nextJournee ? new Date(nextJournee.date) : null;
    console.log("now date is "+now)
    if (now >= journeeDate && (!nextJourneeDate || now < nextJourneeDate)) {
      return journee;
    }
  }
  
  return null;
}

async getPlayerNextFixture(playerTeamId: string): Promise<{ adversaryTeam: string } | null> {
  try {
    // Get current journee
    const currentJournee = await this.getCurrentJournee();
    if (!currentJournee) {
      console.log('No current journee found');
      return null;
    }

    //console.log(`Looking for team ${playerTeamId} fixture starting from round ${currentJournee.round}`);

    // Get all journees from current round onwards, sorted by round
    const upcomingJournees = await this.journeeModel
      .find({ round: { $gte: currentJournee.round } })
      .sort({ round: 1 })
      .exec();

    // Convert playerTeamId to ObjectId once
    const playerTeamObjectId = new Types.ObjectId(playerTeamId);

    // Search through each journee starting from current
    for (const journee of upcomingJournees) {
      console.log(`Checking fixtures in round ${journee.round}`);

      // Find fixture where player's team is playing (home or away)
      const fixture = await this.FutureFixtureModel.findOne({
        journee: journee._id,
        $or: [
          { homeKey: playerTeamObjectId },
          { awayKey: playerTeamObjectId }
        ]
      }).lean();

      if (fixture) {
        //console.log(`✅ Found fixture for team ${playerTeamId} in round ${journee.round}`);

        // Determine adversary team correctly
        const adversaryTeamId = fixture.homeKey.toString() === playerTeamObjectId.toString()
          ? fixture.awayKey
          : fixture.homeKey;

        // Get adversary team details
        const adversaryTeam = await this.teamModel.findById(adversaryTeamId).lean();
        if (!adversaryTeam) {
          console.warn(`❌ Adversary team not found for fixture ${fixture._id}`);
          return null;
        }

        return {
          adversaryTeam: adversaryTeam.name
        };
      } else {
        console.log(`❌ No fixture found for team ${playerTeamId} in round ${journee.round}`);
      }
    }

    console.log(`No future fixtures found for team ${playerTeamId}`);
    return null;

  } catch (error) {
    console.error('Error finding player next fixture:', error);
    return null;
  }
}
async getSofaMatchFixtures(roundNumber :number)
{
  this.apiService.getMatchesByRoundSofa(roundNumber)



}



//---------------------------------------------------------------------------------------------------------------------
async getLatestFantasyTeamWithAdversaryInfo(userId: string) {
  const userObjectId = new Types.ObjectId(userId);

  // 1️⃣ Get all WeeklyTeams for this user and populate round
  const allWeeklyTeams = await this.weeklyTeamModel
    .find({ user_id: userObjectId })
    .populate("round")
    .exec();

  if (!allWeeklyTeams.length) {
    return { weeklyTeamId: null, players: [] };
  }

  // 2️⃣ Find latest weekly team by roundNumber
  const latestWeeklyTeam = allWeeklyTeams.reduce((latest, current) => {
    const currentRoundNumber = (current.round as Round)?.roundNumber || 0;
    const latestRoundNumber = (latest.round as Round)?.roundNumber || 0;
    return currentRoundNumber > latestRoundNumber ? current : latest;
  });

  if (!latestWeeklyTeam) {
    return { weeklyTeamId: null, players: [] };
  }

  // 3️⃣ Latest round (global)
  const currentRound = await this.roundModel.findOne().sort({ roundNumber: -1 }).exec();

  // 4️⃣ Get fantasy players in this team
  const fantasyPlayers = await this.fantasyTeamModel
    .find({ WeeklyTeam: latestWeeklyTeam._id })
    .populate({
      path: "player_id",
      populate: { path: "team_id" },
    })
    .exec();

  // 5️⃣ Enrich players
  const enrichedPlayers = await Promise.all(
    fantasyPlayers.map(async (entry) => {
      const player = entry.player_id as any;
      if (!player) return null;

      const teamId = player.team_id._id;

      const result = {
        id: player._id.toString(),
        name: player.name,
        position: player.position,
        team: player.team_id?.name || "Unknown",
        adversary: null as string | null,
        score: 0,
        isCaptain: entry.isCaptain,
        isViceCaptain: entry.isViceCaptain,
        isBench: entry.isBench,
        dispaly_ennemy: false,
      };

      // Helper: parse fixture date safely
      const parseFixtureDate = (fixture: any) => {
        const [year, month, day] = fixture.date.trim().split("-").map(Number);
        const [hours = 0, minutes = 0, seconds = 0] = fixture.eventTime
          ? fixture.eventTime.trim().split(":").map(Number)
          : [0, 0, 0];
        return new Date(year, month - 1, day, hours, minutes, seconds);
      };

      // 5.1️⃣ Try to find fixture in current round
      const fixture = await this.fixtureModel
        .findOne({
          round: currentRound._id,
          $or: [{ homeTeam: teamId }, { awayTeam: teamId }],
        })
        .populate(["homeTeam", "awayTeam"])
        .lean();

      if (fixture) {
        const eventDateTime = parseFixtureDate(fixture);

        // Determine adversary safely
        let adversaryTeamDoc: any = null;

        const homePopulated = fixture.homeTeam && typeof fixture.homeTeam === "object" && "name" in fixture.homeTeam;
        const awayPopulated = fixture.awayTeam && typeof fixture.awayTeam === "object" && "name" in fixture.awayTeam;

        if (homePopulated && awayPopulated) {
          adversaryTeamDoc =
            fixture.homeTeam._id.toString() === teamId.toString()
              ? fixture.awayTeam
              : fixture.homeTeam;
        } else {
          const homeId = (fixture.homeTeam as any)?._id ?? fixture.homeTeam;
      const awayId = (fixture.awayTeam as any)?._id ?? fixture.awayTeam;


          const adversaryId = homeId.toString() === teamId.toString() ? awayId : homeId;
          adversaryTeamDoc = await this.teamModel.findById(adversaryId).lean();
        }

        result.adversary = adversaryTeamDoc?.name ?? "Unknown";

        // Display enemy only if fixture is in the future
        result.dispaly_ennemy = eventDateTime > new Date();
      } else {
        // 5.2️⃣ No fixture in current round → look ahead
        const nextFixture = await this.getPlayerNextFixture(player.team_id);
        if (nextFixture) {
          result.adversary = nextFixture.adversaryTeam ?? "Unknown";
          result.dispaly_ennemy = true;
        } else {
          result.dispaly_ennemy = false;
        }
      }

      // 5.3️⃣ Player score in current round
      const stat = await this.playerStatModel
        .findOne({
          round_id: currentRound._id,
          player_id: player._id,
        })
        .lean();

      if (stat) result.score = stat.score || 0;

      return result;
    })
  );

  return {
    weeklyTeamId: latestWeeklyTeam._id,
    players: enrichedPlayers.filter((p) => p !== null),
  };
}

//-------------------------------------------------------------------------------------------------------------------------------------------------
async calculateScore(userId: string): Promise<void> {
  // 1. Get the latest fantasy team
  const fantasyTeam = await this.getLatestFantasyTeamWithAdversaryInfo(userId);
//console.log("0000000000000 " + JSON.stringify(fantasyTeam, null, 2));
  if (!fantasyTeam || !fantasyTeam.players || fantasyTeam.players.length === 0) {
    console.log('No fantasy team found or team is empty.');
    return 
  }

  console.log(fantasyTeam)
  let totalScore = 0;

var currentRound =  this.roundModel
    .findOne()
    .sort({ roundNumber: -1 }) // Sort descending by roundNumber
    .exec();
    var currentRoundId = (await currentRound)._id

  for (const player of fantasyTeam.players) {
    // 2. Get player stat
    const playerStat = await this.playerStatModel.findOne({
      player_id: player.id,
      round_id:  currentRoundId, // You must ensure roundId is included in the result
    });
           // console.log("this istge plkayer stats"+playerStat)
    if (!playerStat) continue; // Skip if no stats found

    let score = playerStat.score || 0;

    // 3. Apply user settings
    if (player.isCaptain) {
      score *= 2;
    } else if (player.isViceCaptain) {
      score *= 1.5;
    } else if (player.isBench) {
      score = 0;
    }

    // 4. Accumulate
    totalScore += score;
  }

  // 5. Upsert WeeklyScore (insert or update)
  await this.WeeklyScoreModel.findOneAndUpdate(
    {
      user: new Types.ObjectId(userId),
      round: currentRoundId,
    },
    {
      user:  new Types.ObjectId(userId),
      round: currentRoundId,
      score: totalScore,
    },
    { upsert: true, new: true }
  );
}


async updateFantasyTeam(
  userId: string,
  players: {
    player_id: number;
    isCaptain: boolean;
    isViceCaptain: boolean;
    isBench: boolean;
  }[],
): Promise<void> {
  const userObjectId = new Types.ObjectId(userId);

  // Get latest round
  const currentRound = await this.roundModel.findOne().sort({ roundNumber: -1 }).exec();
  if (!currentRound) throw new Error('No round found');

  // Get user's last WeeklyTeam
  const lastWeeklyTeam = await this.getLastWeeklyTeam(userId);
//
//  console.log("this is the the last weklyteam "+lastWeeklyTeam.round)
//  console.log("this is the last round id "+currentRound)
if (
  lastWeeklyTeam &&
  String((lastWeeklyTeam.round as any)._id || lastWeeklyTeam.round) === String(currentRound._id)
) {
  const weeklyTeamId = (lastWeeklyTeam as any)._id;

  // ✅ REMOVE ALL existing fantasy players for that weekly team
  await this.fantasyTeamModel.deleteMany({ WeeklyTeam: weeklyTeamId });

  // ✅ Filter out duplicates from input
  const uniquePlayersMap = new Map<number, any>();
  for (const player of players) {
    uniquePlayersMap.set(player.player_id, player);
  }
  const uniquePlayers = [...uniquePlayersMap.values()];

  // ✅ Insert all fresh
  const newFantasyPlayers = uniquePlayers.map((player) => ({
    player_id: player.player_id,
    isCaptain: player.isCaptain,
    isViceCaptain: player.isViceCaptain,
    isBench: player.isBench,
    WeeklyTeam: weeklyTeamId,
  }));

  await this.fantasyTeamModel.insertMany(newFantasyPlayers);

  console.log('✅ Fantasy team replaced for existing weekly team.');
}


 else {
    // 🆕 Create new WeeklyTeam
    const newWeeklyTeam = await this.weeklyTeamModel.create({
      user_id: userObjectId,
      round: currentRound._id,
      nb_transfert: 2,
      score: 0,
    });

    // Insert new FantasyTeam entries
    const fantasyTeams = players.map(player => ({
      player_id: player.player_id,
      isCaptain: player.isCaptain,
      isViceCaptain: player.isViceCaptain,
      isBench: player.isBench,
      WeeklyTeam: newWeeklyTeam._id,
    }));

    await this.fantasyTeamModel.insertMany(fantasyTeams);
    console.log("fantazyteam created new ")
  }
}

async getLastWeeklyTeam(userId: string): Promise<WeeklyTeam | null> {
  const teams = await this.weeklyTeamModel
    .find({ user_id: new Types.ObjectId(userId) })
    .populate('round')
    .exec();
  if (!teams.length) return null;

  // Sort manually by round.roundNumber
  teams.sort((a, b) => {
    const aRoundNumber = (a.round as Round).roundNumber
    const bRoundNumber = (b.round as Round).roundNumber
    return bRoundNumber - aRoundNumber; // descending
  });
  return teams[0];
}






//--------------------------------------------------------------------------------------------------------------------------------------------

async saveFantasyTeam(
  userId: string,
  players: {
    player_id: number;
    isCaptain: boolean;
    isViceCaptain: boolean;
    isBench: boolean;
  }[],
): Promise<FantasyTeam[]> {
  const userObjectId = new Types.ObjectId(userId);

  // 1. Get the latest round (assumes roundNumber is increasing)
  const latestRound = await this.roundModel.findOne().sort({ roundNumber: -1 });
  if (!latestRound) {
    throw new Error('No round found');
  }

  // 2. Create a new WeeklyTeam
  const weeklyTeam = await this.weeklyTeamModel.create({
    user_id: userObjectId,
    round: latestRound._id,
    nb_transfert: 2,
    score: 0,
  });

  // 3. Delete previous fantasy team for this user
 // await this.fantasyTeamModel.deleteMany({ WeeklyTeam: weeklyTeam._id });

  // 4. Create the new fantasy team linked to the WeeklyTeam
  const fantasyTeamDocs = players.map((player) => ({
    player_id: player.player_id,
    isCaptain: player.isCaptain,
    isViceCaptain: player.isViceCaptain,
    isBench: player.isBench,
    WeeklyTeam: weeklyTeam._id, // link to new weekly team
  }));

  const createdFantasyTeam = await this.fantasyTeamModel.insertMany(fantasyTeamDocs);

  // 5. Optionally update weeklyTeam to reference one of its fantasy players
  // (If this is necessary, otherwise skip it)
  if (createdFantasyTeam.length > 0) {
    await this.weeklyTeamModel.updateOne(
      { _id: weeklyTeam._id },
      { fantasyTeam: createdFantasyTeam[0]._id } // or use a better strategy
    );
  }

  return createdFantasyTeam;
}

//-------------------------------------------------------------------------------------------------------------------------------------------------

  create() {
    return 'This action adds a new fantasyTeam';
  }

  findAll() {
    return `This action returns all fantasyTeam`;
  }

  findOne(id: number) {
    return `This action returns a #${id} fantasyTeam`;
  }

  update(id: number, updateFantasyTeamDto: UpdateFantasyTeamDto) {
    return `This action updates a #${id} fantasyTeam`;
  }

  remove(id: number) {
    return `This action removes a #${id} fantasyTeam`;
  }












/*async updateLivePlayerStatsFromApi() {
  console.log('[updateLivePlayerStatsFromApi] Starting update...');

  const apiData = await this.getMockLiveScores();

  if (!Array.isArray(apiData.result)) {
    console.warn('[updateLivePlayerStatsFromApi] Invalid or missing result in API data');
    return;
  }

  console.log(JSON.stringify(apiData.result, null, 2));

  const currentRound = await this.roundModel.findOne().sort({ roundNumber: -1 });
  if (!currentRound) {
    throw new Error('[updateLivePlayerStatsFromApi] No current round found');
  }

  for (const match of apiData.result) {
    const homeTeamId = Number(match.home_team_key);
    const awayTeamId = Number(match.away_team_key);
    console.log(`🏠 Home Team ID: ${homeTeamId}, 🛫 Away Team ID: ${awayTeamId}`);

    // Track player updates for this match
    const playerUpdates: Record<number, {
      score: number;
      goals: number;
      redCard: boolean;
      yellowCard: boolean;
      substituted: boolean;
      isPlayed: boolean;
    }> = {};

    const allInMatchPlayers = new Set<number>();
    const subs = match.substitutes || [];
    const homeSubs = subs.filter(s => s.home_scorer);
    const awaySubs = subs.filter(s => s.away_scorer);

    // Initialize player update helper function
    const initPlayerUpdate = (playerId: number) => {
      if (!playerUpdates[playerId]) {
        playerUpdates[playerId] = {
          score: 0,
          goals: 0,
          redCard: false,
          yellowCard: false,
          substituted: false,
          isPlayed: false
        };
      }
    };

    // Step 1: Starting XI (appearance points)
    for (const side of ['home_team', 'away_team']) {
      const lineup = match.lineups?.[side]?.starting_lineups || [];
      const teamId = side === 'home_team' ? homeTeamId : awayTeamId;

      for (const starter of lineup) {
        const player = await this.findPlayerByNameAndTeam(starter.player, teamId);
        if (!player) continue;
        
        initPlayerUpdate(player._id);
        playerUpdates[player._id].score += 2; // Starting XI gets 2 points
        playerUpdates[player._id].isPlayed = true;
        allInMatchPlayers.add(player._id);
      }
    }

    // Step 2: Handle substitutions
    for (const sub of [...homeSubs, ...awaySubs]) {
      const isHome = typeof sub.home_scorer === 'object' && sub.home_scorer?.in;
      const isAway = typeof sub.away_scorer === 'object' && sub.away_scorer?.in;

      let teamId: number;
      let inName: string | undefined;
      let outName: string | undefined;

      if (isHome) {
        teamId = homeTeamId;
        inName = sub.home_scorer.in;
        outName = sub.home_scorer.out;
      } else if (isAway) {
        teamId = awayTeamId;
        inName = sub.away_scorer.in;
        outName = sub.away_scorer.out;
      } else {
        console.warn('⚠️ Substitution with unknown side:', JSON.stringify(sub));
        continue;
      }

      // Handle player going out (substituted)
      if (outName) {
        console.log(`⛔ OUT: ${outName} from team ${teamId}`);
        const playerOut = await this.findPlayerByNameAndTeam(outName, teamId);
        if (!playerOut) {
          console.warn(`❌ Outgoing player not found: ${outName}`);
        } else {
          initPlayerUpdate(playerOut._id);
          playerUpdates[playerOut._id].substituted = true;
          // If they were starting XI, downgrade from 2 to 1 point
          if (playerUpdates[playerOut._id].score === 2) {
            playerUpdates[playerOut._id].score = 1;
          }
          console.log(`🔻 Player ${playerOut.name} marked as substituted`);
        }
      }

      // Handle player coming in (substitute appearance)
      if (inName) {
        console.log(`✅ IN: ${inName} to team ${teamId}`);
        const playerIn = await this.findPlayerByNameAndTeam(inName, teamId);
        if (!playerIn) {
          console.warn(`❌ Incoming player not found: ${inName}`);
        } else {
          initPlayerUpdate(playerIn._id);
          playerUpdates[playerIn._id].score += 1; // Substitute gets 1 point
          playerUpdates[playerIn._id].isPlayed = true;
          allInMatchPlayers.add(playerIn._id);
          console.log(`🆕 Player ${playerIn.name} added as substitute`);
        }
      }
    }

    // Step 3: Goals
    for (const goal of match.goalscorers || []) {
      const processGoal = async (
        playerName: string,
        playerIdStr: string,
        teamId: number,
        isOG: boolean
      ) => {
        let player = null;
        const playerIdNum = Number(playerIdStr);
        
        if (playerIdStr && !isNaN(playerIdNum)) {
          player = await this.findPlayerByApiId(playerIdNum);
        }
        if (!player && playerName) {
          const cleanName = playerName.replace(' (o.g.)', '').trim();
          player = await this.findPlayerByNameAndTeam(cleanName, teamId);
        }
        if (!player) {
          console.warn(`[Goal] Player not found: ${playerName} [${playerIdStr}]`);
          return;
        }

        initPlayerUpdate(player._id);
        allInMatchPlayers.add(player._id);
        
        if (isOG) {
          // Own goal - deduct points but don't increment goals counter
          playerUpdates[player._id].score -= 2;
        } else {
          // Regular goal - increment goals and add points based on position
          playerUpdates[player._id].goals += 1;
          const goalPoints = this.getGoalPointsByPosition(player.position);
          playerUpdates[player._id].score += goalPoints;
        }
        
        console.log(`[Goal] ${isOG ? 'Own goal' : 'Goal'} processed for ${player.name}`);
      };

      if (goal.home_scorer) {
        const isOG = goal.home_scorer.includes('(o.g.)');
        await processGoal(goal.home_scorer, goal.home_scorer_id, homeTeamId, isOG);
      }
      if (goal.away_scorer) {
        const isOG = goal.away_scorer.includes('(o.g.)');
        await processGoal(goal.away_scorer, goal.away_scorer_id, awayTeamId, isOG);
      }
    }

    // Step 4: Cards
    for (const card of match.cards || []) {
      const processCard = async (
        playerName: string,
        playerIdStr: string,
        teamId: number,
        type: string
      ) => {
        let player = null;
        const playerIdNum = Number(playerIdStr);

        console.log(`[Card] Processing card for: ${playerName} (${type}) with ID: ${playerIdStr}, teamId: ${teamId}`);

        if (playerIdStr && !isNaN(playerIdNum)) {
          player = await this.findPlayerByApiId(playerIdNum);
          if (player) {
            console.log(`[Card] Found player by API ID: ${player.name} (${player._id})`);
          }
        }

        if (!player && playerName) {
          player = await this.findPlayerByNameAndTeam(playerName, teamId);
          if (player) {
            console.log(`[Card] Found player by Name + Team: ${player.name} (${player._id})`);
          }
        }

        if (!player) {
          console.warn(`[Card] Player not found: ${playerName} [${playerIdStr}]`);
          return;
        }

        initPlayerUpdate(player._id);
        allInMatchPlayers.add(player._id);
        
        // Update card fields and deduct points
        if (type === 'red card') {
          playerUpdates[player._id].redCard = true;
          playerUpdates[player._id].score -= 3;
        } else if (type === 'yellow card') {
          playerUpdates[player._id].yellowCard = true;
          playerUpdates[player._id].score -= 1;
        }

        console.log(`[Card] Applied ${type} to player ${player.name}`);
      };

      if (card.home_fault)
        await processCard(card.home_fault, card.home_player_id, homeTeamId, card.card);

      if (card.away_fault)
        await processCard(card.away_fault, card.away_player_id, awayTeamId, card.card);
    }

    // Step 5: Save all player updates to database
    for (const [playerIdStr, updates] of Object.entries(playerUpdates)) {
      const playerId = Number(playerIdStr);
      if (!allInMatchPlayers.has(playerId)) continue;

      const playerName = (await this.playerModel.findById(playerId))?.name || 'Unknown';

      // Build the update object
      const updateData: any = {
        $inc: { 
          score: updates.score,
          goals: updates.goals 
        },
        $set: {}
      };

      // Only set boolean fields if they are true
      if (updates.redCard) updateData.$set.redCard = true;
      if (updates.yellowCard) updateData.$set.yellowCard = true;
      if (updates.substituted) updateData.$set.substituted = true;
      if (updates.isPlayed) updateData.$set.isPlayed = true;

      // Remove $set if empty
      if (Object.keys(updateData.$set).length === 0) {
        delete updateData.$set;
      }

      await this.playerStatModel.findOneAndUpdate(
        { player_id: playerId, round_id: currentRound._id },
        updateData,
        { upsert: true, new: true }
      );

      console.log(`[DB Update] Player ${playerName} → Score: +${updates.score}, Goals: +${updates.goals}, Red: ${updates.redCard}, Yellow: ${updates.yellowCard}, Substituted: ${updates.substituted}, Played: ${updates.isPlayed}`);
    }
  }

  console.log('[updateLivePlayerStatsFromApi] Finished updating player stats.');
}*/

  // Small helper to normalize names
  normalizeName1(name: string): string {
    return name
      .toLowerCase()
      .replace(/\./g, '')        // remove dots
      .replace(/\s+/g, ' ')      // collapse multiple spaces
      .trim();
  }async findPlayerByApproxName(apiName: string, teamId: string) {
  // Normalize API name
  const normalizedApi = this.normalizeName(apiName);

  // Pull all players for this team once
  const teamPlayers = await this.playerModel.find({ team_id: new Types.ObjectId(teamId) });

  // 1️⃣ Try exact normalized match
  let player = teamPlayers.find(p => 
    this.normalizeName(p.name) === normalizedApi
  );
  if (player) return player;

  // 2️⃣ Try reversed format
  const reversed = this.reverseNameFormat(apiName);
  player = teamPlayers.find(p =>
    this.normalizeName(p.name) === this.normalizeName(reversed)
  );
  if (player) return player;

  // 3️⃣ Try last name + initial rule
  player = teamPlayers.find(p =>
    this.matchLastNameAndInitial(apiName, p.name)
  );
  if (player) return player;

  // 4️⃣ Fuzzy similarity
  let bestMatch: { player: any; score: number } | null = null;
  for (const p of teamPlayers) {
    const sim = this.similarity(normalizedApi, this.normalizeName(p.name));
    if (!bestMatch || sim > bestMatch.score) {
      bestMatch = { player: p, score: sim };
    }
  }

  if (bestMatch && bestMatch.score > 0.6) {
    console.log(`🤝 Fuzzy matched ${apiName} -> ${bestMatch.player.name} (score=${bestMatch.score})`);
    return bestMatch.player;
  }

  console.warn(`❌ Could not match player: ${apiName} in team ${teamId}`);
  return null;
}

async updateLivePlayerStatsFromApi(round:number) {
  console.log('[updateLivePlayerStatsFromApi] Starting update...');

  const matches = await this.apiService.getMatchesByRoundSofa(round);
  if (!Array.isArray(matches)) {
    console.log('Invalid matches list format');
    return;
  }

  try {
    const currentRound = await this.roundModel.findOne().sort({ roundNumber: -1 });
    if (!currentRound) console.log('No current round found');

    const fixtures = await this.fixtureModel.find({ round: currentRound._id });

    for (const fixture of fixtures) {
      await this.processFixture(fixture, matches, currentRound._id);
    }

    console.log('[updateLivePlayerStatsFromApi] Finished updating player stats.');
  } catch (err) {
    console.error('Error updating live player stats:', err);
  }
}



private async processFixture(fixture: any, matches: any[], roundId: Types.ObjectId) {
  const [homeTeamDoc, awayTeamDoc] = await Promise.all([
    this.teamModel.findById(fixture.homeTeam),
    this.teamModel.findById(fixture.awayTeam),
  ]);

  if (!homeTeamDoc || !awayTeamDoc) {
    console.warn(`Missing team data for fixture ${fixture._id}`);
    return;
  }

  const match = this.findApiMatch(matches, homeTeamDoc, awayTeamDoc);
  if (!match) {
    console.log(`No API match found for fixture ${fixture._id}`);
    return;
  }

  await this.updateFixtureSofaId(fixture, match);

  if (!fixture.Lined) {
    await this.processLineup(fixture, match.match_id, roundId);
  }

  await this.processLiveEvents(fixture, match.match_id, homeTeamDoc.team_id.toString(), awayTeamDoc.team_id.toString(), roundId);
}

private findApiMatch(matches: any[], homeTeamDoc: any, awayTeamDoc: any) {
  return matches.find(
    m =>
      (m.home_team_code === homeTeamDoc.team_sofa_id && m.away_team_code === awayTeamDoc.team_sofa_id) ||
      (m.home_team_code === awayTeamDoc.team_sofa_id && m.away_team_code === homeTeamDoc.team_sofa_id)
  );
}
private async updateFixtureSofaId(fixture: any, match: any) {
  if (!fixture.sofamatchId) {
    fixture.sofamatchId = match.match_id;
    await fixture.save();
    console.log(`Updated fixture ${fixture._id} with Sofascore matchId ${match.match_id}`);
  }
}

private async processLineup(fixture: any, matchId: string, roundId: Types.ObjectId) {
  const lineupResult = await this.apiService.getLineupsofa(matchId);

  if (!lineupResult) return;

  for (const player of lineupResult.homeTeam) {
    const found = await this.updatePlayerLineup(player.id, roundId, 2);
    if (!found) {
      console.warn(`⚠️ Player with ID ${player.id} (Home) not found in DB`);
    }
  }

  for (const player of lineupResult.awayTeam) {
    const found = await this.updatePlayerLineup(player.id, roundId, 2);
    if (!found) {
      console.warn(`⚠️ Player with ID ${player.id} (Away) not found in DB`);
    }
  }

  fixture.Lined = true;
  await fixture.save();
  console.log(`✅ Lineup processed for fixture ${fixture._id}`);
}


private async updatePlayerLineup(
  playerId: string,
  roundId: Types.ObjectId,
  lineupBonus: number
): Promise<boolean> {
  const updated = await this.playerStatModel.findOneAndUpdate(
    { player_id: playerId, round_id: roundId },
    { $set: { isPlayed: true, lineupBonus, score: lineupBonus } },
    { upsert: true, new: true }
  );

  const test = await this.playerModel.findById(playerId).exec();

  if (!test) {
    console.warn(`⚠️ Missing player with ID ${playerId}`);
    return false;
  }

  if (test.id === "2228530" || test.id === 2228530) {
    console.log("✅ Special case: found player 2228530");
  }

  console.log(`ℹ️ Found player: ${test.name} (ID: ${test.id})`);

  return !!updated;
}

private async processLiveEvents(fixture: any, matchId: string, homeCode: string, awayCode: string, roundId: Types.ObjectId) {
  const apiData = await this.apiService.getLiveUpdatefromsofa(matchId, homeCode, awayCode);
  if (!apiData?.halves?.length) return;

  const playerUpdates = this.extractPlayerUpdates(apiData);

  for (const [playerId, updates] of Object.entries(playerUpdates)) {
    await this.savePlayerStats(Number(playerId), updates, roundId);
  }
}
private extractPlayerUpdates(apiData: any) {
  const playerUpdates: Record<number, any> = {};

  const initPlayerUpdate = (playerId: number) => {
    if (!playerUpdates[playerId]) {
      playerUpdates[playerId] = {
        totalScore: 0,
        totalGoals: 0,
        redCard: false,
        yellowCard: false,
        substituted: false,
        isPlayed: false,
        playedMinutes: 0,
        lineupBonus: 2,
        assist: 0,
      };
    }
  };

  for (const half of apiData.halves) {
    if (!half.events) continue;
    for (const event of half.events) {
      const playerId = event.player_id;
      const munite = event.minute
      if (!playerId) continue;

      initPlayerUpdate(playerId);

      switch (event.event_type) {
        case 'Goal':
        case 'Penalty':
          playerUpdates[playerId].totalGoals += 1;
          playerUpdates[playerId].totalScore += 5; // or use getGoalPointsByPosition
          playerUpdates[playerId].isPlayed = true;
          break;
        case 'Assistance':
          playerUpdates[playerId].totalScore += 2;
          playerUpdates[playerId].assist += 1;
          playerUpdates[playerId].isPlayed = true;
          break;
        case 'Yellow Card':
          playerUpdates[playerId].yellowCard = true;
          playerUpdates[playerId].totalScore -= 1;
                    playerUpdates[playerId].isPlayed = true;

          break;
        case 'Red Card':
          playerUpdates[playerId].redCard = true;
          playerUpdates[playerId].totalScore -= 3;
          playerUpdates[playerId].isPlayed = true;

          break;
          case 'Substitution - In':
          this.processSubstitution( "Substitution - In", playerId, munite, playerUpdates, 90)

          break;
           case 'Substitution - Out':
          this.processSubstitution( "Substitution - Out", playerId, munite, playerUpdates, 90)

      }
    }
  }

  return playerUpdates;
}


private async savePlayerStats(playerId: number, updates: any, roundId: Types.ObjectId) {
  await this.playerStatModel.findOneAndUpdate(
    { player_id: playerId, round_id: roundId },
    { $set: {
        score: updates.totalScore + updates.lineupBonus,
        goals: updates.totalGoals,
        isPlayed: updates.isPlayed,
        assist: updates.assist,
        redCard: updates.redCard || undefined,
        yellowCard: updates.yellowCard || undefined,
        substituted: updates.substituted || undefined,
      }
    },
    { upsert: true, new: true }
  );
}




// Updated processSubstitution method
processSubstitution(event_type: string, playerId: number, minuteStr: string, playerUpdates: Record<number, any>, currentMatchTime = 90) {
  const player = playerUpdates[playerId];
  if (!player) return;

  const minute = this.parseMinute(minuteStr);

  switch (event_type) {
    case 'Substitution - In':
      player.isPlayed = true;
      player.substituted = false;
      // Coming in always gives at least +1 point
      player.lineupBonus = 1; 
      // If he can play >60 minutes (entered before currentMatchTime - 60), add another point
      //console.log("event time "+minute)
      if ((currentMatchTime - minute) > 60) {
        player.lineupBonus = 2;  
      }
      break;

    case 'Substitution - Out':
      player.isPlayed = true;
      player.substituted = true;

      // If he played more than 60 mins → add 2, else → add 1
      if (minute > 60) {
        //player.totalScore += 2;  
      } else {
        player.lineupBonus = 1;  // Changed to totalScore
      }
      break;
  }
}

// Normalize "45+3'" -> 48
parseMinute(minuteStr: string): number {
  if (!minuteStr) return 0;
  if (minuteStr.includes('+')) {
    const [base, extra] = minuteStr.replace("'", "").split('+').map(Number);
    return base + (extra || 0);
  }
  return parseInt(minuteStr.replace("'", ""), 10);
}











// Finds a player using the API's player ID (e.g., 3230757690)
async findPlayerByApiId(apiId: number) {
  return await this.playerModel.findOne({ _id: apiId }); // or whatever field you use
}


// Supporting function for goal points by position (unchanged)
private getGoalPointsByPosition(position: string): number {
  switch (position?.toLowerCase()) {
    case 'goalkeepers':
      return 10;
    case 'defender':
      return 6;
    case 'midfielder':
      return 5;
    case 'forward':
    default:
      return 4;
  }
}
/*
// Supporting function to find player by name and team (unchanged)
private async findPlayerByNameAndTeam(playerName: string, apiTeamId: number) {

//console.log("the team id from the api is  : "+apiTeamId)

  const team = await this.teamModel.findOne({ team_id: apiTeamId });

console.log("the player name is "+playerName +"and its team is "+team.name)
 //console.log(team)
  if (!team) return null;

  return this.playerModel.findOne({
    name: { $regex: new RegExp(`^${this.escapeRegex(playerName)}$`, 'i') },
    team_id: team._id,
  });
}
*/
// Enhanced helper function to find player with flexible name matching
async findPlayerByNameAndTeam(apiPlayerName: string, teamId: number) {
   //console.log(`🔍 Looking for player "${apiPlayerName}" in team ${teamId}`);

  const team = await this.teamModel.findOne({ team_id: teamId });
  if (!team) {
    console.warn(`❌ Team ID ${teamId} not found`);
    return null;
  }
const teamIdRaw = team._id;

  let team_idp: Types.ObjectId;
  if (teamIdRaw instanceof Types.ObjectId) {
    // Already an ObjectId, just assign it
    team_idp = teamIdRaw;
  } else if (typeof teamIdRaw === 'string' || teamIdRaw instanceof Buffer) {
    // Convert string or Buffer to ObjectId
    team_idp = new Types.ObjectId(teamIdRaw);
  } else {
    throw new Error("Invalid team._id type, expected ObjectId, string or Buffer");
  }

  const teamPlayers = await this.playerModel.find({ team_id :new Types.ObjectId(team_idp)  });

  //console.log("this is the id of the team " + team_idp);

  if (!teamPlayers.length) {
    console.warn(teamPlayers)
    console.warn(`❌ te7cha No players found in team ${team.name}`);
    return null;
  }

  const cleanApiName = this.normalizeName(apiPlayerName);

  for (const player of teamPlayers) {
    const cleanDbName = this.normalizeName(player.name);

    // 1. Exact normalized match
    if (cleanApiName === cleanDbName) return player;

    // 2. Reverse API name and compare to DB
    if (this.normalizeName(this.reverseNameFormat(apiPlayerName)) === cleanDbName) return player;

    // 3. Reverse DB name and compare to API normalized
    if (cleanApiName === this.normalizeName(this.reverseNameFormat(player.name))) return player;

    // 4. Match by last name + first initial
    if (this.matchLastNameAndInitial(apiPlayerName, player.name)) return player;

    // 5. Fuzzy match by similarity threshold
    if (this.similarity(cleanApiName, cleanDbName) > 0.8) return player;
  }

  console.warn(`❌ No player match for "${apiPlayerName}"`);
  return null;
}

normalizeName(name: string): string {
  return name.toLowerCase()
    .replace(/[.,]/g, '')  // remove dots/commas
    .replace(/\s+/g, ' ')  // collapse spaces
    .trim();
}

reverseNameFormat(name: string): string {
  const parts = name.trim().split(' ');
  if (parts.length === 2) {
    return `${parts[1]} ${parts[0]}`; // simple swap
  }
  return name;
}

matchLastNameAndInitial(apiName: string, dbName: string): boolean {
  const apiParts = apiName.trim().split(' ');
  const dbParts = dbName.trim().split(' ');

  if (apiParts.length < 2 || dbParts.length < 2) return false;

  const apiLast = apiParts[0].toLowerCase();
  const apiInitial = apiParts[1].charAt(0).toLowerCase();

  const dbLast = dbParts[dbParts.length - 1].toLowerCase();
  const dbInitial = dbParts[0].charAt(0).toLowerCase();

  return apiLast === dbLast && apiInitial === dbInitial;
}

similarity(s1: string, s2: string): number {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  return (longer.length - this.levenshteinDistance(longer, shorter)) / longer.length;
}

levenshteinDistance(a: string, b: string): number {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      matrix[i][j] = b.charAt(i - 1) === a.charAt(j - 1)
        ? matrix[i - 1][j - 1]
        : Math.min(matrix[i - 1][j - 1] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j] + 1);
    }
  }

  return matrix[b.length][a.length];
}

private escapeRegex(text: string): string {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
async getMockLiveScores(matchId?: string, homeCode?: string, awayCode?: string): Promise<any> {
  try {
    // Use provided parameters or default values
    const finalMatchId = matchId || 'WpzcRYWi';
    const finalHomeCode = homeCode || '7600';
    const finalAwayCode = awayCode || '7611';
    
    const apiUrl = `http://flask-api:5000/events?match_id=${finalMatchId}&home_code=${finalHomeCode}&away_code=${finalAwayCode}`;
    
    console.log(`[getMockLiveScores] Calling API: ${apiUrl}`);
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`API request failed with status: ${response.status} - ${response.statusText}`);
    }
    
    const data = await response.json();
    
    console.log(`[getMockLiveScores] API response received for match ${finalMatchId}`);
    
    return data;
    
  } catch (error) {
    console.error('[getMockLiveScores] Error calling events API:', error);
    throw error; // Re-throw to let calling function handle it
  }
}


   /*
    
  const url = 'https://apiv2.allsportsapi.com/football/';
  const data = qs.stringify({
    met: 'Livescore',
    APIkey: '0d965af55590b50ff98bece5eb41a8a69f20b17af082d561540ab871e136b1d9',
    countryId: '110',
    timezone: 'Africa/Tunis',
    withPlayerStats: '1',
  });

  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
  };

  try {
    const response = await firstValueFrom(
      this.httpService.post(url, data, { headers })
    );
    console.log('[getMockLiveScores] Success:', response.status);
    return response.data; // ✅ Return only the JSON payload
  } catch (error) {
    console.error('❌ Error fetching live scores:', error.message);
    throw error;
  }*/
    






/*
 matchTemplate = {
  success: 1,
  result: [{
    event_key: 1644813,
    event_date: "2025-08-03",
    event_time: "17:15",
    event_home_team: "Esperance Tunis",
    home_team_key: 7611,
    event_away_team: "Stade Tunisien",
    away_team_key: 7618,
    goalscorers: [],
    cards: [],
    substitutes: [],
    // ... you can add all other static fields here if needed
  }]
};

 playersES = [ // Just a few for demo
  "Y. Belaili", "Yan Sasse", "Rodrigo Rodrigues", "H. Dhaou", "K. Guenichi"
];

 simulateLiveUpdate() {
  const actions = ['goal', 'yellow', 'red', 'substitution'];
  const action = actions[Math.floor(Math.random() * actions.length)];

  const match = JSON.parse(JSON.stringify(this.matchTemplate)).result[0];
  const time = Math.floor(Math.random() * 80) + 10;
  const player = this.playersES[Math.floor(Math.random() * this.playersES.length)];

  const isHomeTeam = Math.random() < 0.5; // Randomly choose home or away team
  const teamPrefix = isHomeTeam ? "home" : "away";

  switch (action) {
    case 'goal':
      match.goalscorers.push({
        time: `${time}`,
        [`${teamPrefix}_scorer`]: player,
        [`${teamPrefix}_scorer_id`]: `${Math.floor(Math.random() * 9999999)}`,
        score: isHomeTeam ? "1 - 0" : "0 - 1",
        info: Math.random() < 0.3 ? "Penalty" : "",
        info_time: "2nd Half"
      });
      break;

    case 'yellow':
    case 'red':
      match.cards.push({
        time: `${time}`,
        [`${teamPrefix}_fault`]: player,
        card: `${action} card`,
        [`${teamPrefix}_player_id`]: `${Math.floor(Math.random() * 9999999)}`,
        info_time: "2nd Half"
      });
      break;

    case 'substitution':
      const subIn = this.playersES.filter(p => p !== player)[Math.floor(Math.random() * (this.playersES.length - 1))];
      match.substitutes.push({
        time: `${time}`,
        [`${teamPrefix}_scorer`]: {
          in: subIn,
          out: player,
          in_id: 0,
          out_id: 0
        },
        score: "substitution",
        info_time: "2nd Half"
      });
      break;
  }

  return {
    success: 1,
    result: [match]
  };
}
*/

}