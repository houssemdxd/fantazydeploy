import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import * as schedule from 'node-schedule';
import { Model, Types } from 'mongoose';
import { FixtureService } from 'src/fixture/fixture.service';
import { RoundService } from 'src/round/round.service';
import { Team } from 'src/team/entities/team.entity';
import { FantasyTeamService } from 'src/fantasy-team/fantasy-team.service';
import { AuthService } from 'src/auth/auth.service';
import { PlayerStatsService } from 'src/player-stats/player-stats.service';
import * as moment from 'moment-timezone';
import { InjectModel } from '@nestjs/mongoose';
import { PlayerStat } from 'src/player-stats/entities/player-stat.entity';
import { Player } from 'src/player/entities/player.entity';
import { Journee } from 'src/journee/entities/journee.entity';
import { ApiserviceService } from 'src/apiservice/apiservice.service';
@Injectable()
export class RoundSchedulerService {
  private readonly logger = new Logger(RoundSchedulerService.name);

  private isCronRunning = false;
  private round = 0;

  private activeFixturesCount = 0; // ✅ track active fixtures

  private readonly CLEAN_SHEET_POINTS = {
    Goalkeepers: 4,
    Defenders: 4,
    Midfielders: 1,
    Forwards: 0,
  };

  constructor(
    @InjectModel('PlayerStat') private readonly playerStatModel: Model<PlayerStat>,
    @InjectModel(Player.name) private readonly playerModel: Model<Player>,
    @InjectModel('Team') private readonly teamModel: Model<Team>,
    @InjectModel('Journee') private readonly journeeModel: Model<Journee>,
    private readonly fixtureService: FixtureService,
    private readonly roundService: RoundService,
    private readonly fantazyTeamService: FantasyTeamService,
    private readonly userService: AuthService,
    private readonly playerStatService: PlayerStatsService,
             private readonly apiService: ApiserviceService, // inject here
    
  ) {}

  async onModuleInit() {
    await this.scheduleNextJournee();
  }

  private async scheduleNextJournee() {
  const now = new Date();
  const allJournees = await this.journeeModel.find({}).sort({ round: 1 }).exec();

  if (!allJournees || allJournees.length === 0) {
    this.logger.warn('⚠️ No journees found in DB. Nothing to schedule.');
    return;
  }

  let currentJournee: Journee = null;

  for (let i = 0; i < allJournees.length; i++) {
    const journee = allJournees[i];
    const nextJournee = allJournees[i + 1];

    const journeeDate = new Date(journee.date);
    const nextJourneeDate = nextJournee ? new Date(nextJournee.date) : null;

    if (now >= journeeDate && (!nextJourneeDate || now < nextJourneeDate)) {
      currentJournee = journee;
      break;
    }
  }

  if (!currentJournee) {
    currentJournee = allJournees.find(j => new Date(j.date) > now);
  }

  if (!currentJournee) {
    this.logger.warn('⚠️ No current or upcoming journee found. Nothing to schedule.');
    return;
  }

  // ✅ If current journee is already completed → move to next journee
  if (currentJournee.compleated) {
    const nextJournee = allJournees.find(j => j.round > currentJournee.round && !j.compleated);
    if (!nextJournee) {
      this.logger.warn(`⚠️ All journees completed. Nothing more to schedule.`);
      return;
    }
    currentJournee = nextJournee;
  }

  const wakeAt = new Date(currentJournee.date);
  const jobName = `wake-for-journee-${currentJournee.round}-${wakeAt.getTime()}`;

  if (!schedule.scheduledJobs[jobName]) {
    this.logger.log(
      `⏰ Scheduling handleCron for journee ${currentJournee.round} at ${wakeAt.toISOString()}`
    );
    schedule.scheduleJob(jobName, wakeAt, async () => {
      await this.handleCron(currentJournee);
      // ❌ Don't reschedule here
      // ✅ Rescheduling is handled after fixtures are completed
    });
  } else {
    this.logger.log(`ℹ️ Job already exists for journee ${currentJournee.round}`);
  }
}


  async handleCron(journee: Journee) {
    if (this.isCronRunning) {
      this.logger.warn('⏳ Skipping cron: already running');
      return;
    }
    this.isCronRunning = true;

    try {
      console.log(journee);

      const currentRound = await this.roundService.getLaastround();
      const todayKey = new Date().toISOString().split('T')[0];

      let shouldCreateNewRound = false;
      if (!currentRound) {
        shouldCreateNewRound = true;
      } else {
        const roundDateKey = new Date(currentRound.createdAt).toISOString().split('T')[0];
        if (roundDateKey !== todayKey) shouldCreateNewRound = true;
      }

      if (shouldCreateNewRound) {
        const newRound = await this.roundService.createRound();
        this.round = newRound.roundNumber;
        this.logger.log(`🚀 Created new round ${this.round}`);
      } else {
        this.round = currentRound.roundNumber;
        this.logger.log(`ℹ️ Using existing round ${this.round}`);
      }

      await this.playerStatService.deleteDuplicateStatsForLastRound();
      await this.playerStatService.generateRandomStatsForLastRound();

            const fixtures = await this.fixtureService.createFixturesFromApi(journee.round);

          if (!fixtures.length) {
        this.logger.warn('⚠️ No fixtures returned from API');
        // ✅ If no fixtures at all → immediately move on
        this.logger.log(`✅ Completed Journee ${journee.round} — Now scheduling Journee ${journee.round + 1}`);
        await this.scheduleNextJournee();

        return;
      }
     await this.fixtureService.updateFixtureMachSofaNumber(journee.round)
var fixturesp = await this.fixtureService.getFixturesOfLastRound()
// 2. Loop fixtures and process only those not lined
  for (const fixture of fixturesp) {
    if (!fixture.Lined) {
      console.log(fixture)
    } else {
      console.log(`Fixture ${fixture._id} already lined, skipping.`);
    }
  }

      this.activeFixturesCount = fixtures.length; // ✅ track how many fixtures to wait for

      fixtures.forEach((fixture, index) => {
        const matchTime = moment
          .tz(`${fixture.date} ${fixture.eventTime}`, 'YYYY-MM-DD HH:mm', 'Africa/Tunis')
          .toDate();
        const now = new Date();
const expiryTime = moment(matchTime).add(2, "hours").toDate();
const scheduleTime = moment(matchTime).subtract(0, 'minutes').toDate();
      console.log("9");

        if (now > expiryTime) {
          this.logger.warn(`⚠️ Skipping past match: ${fixture.homeTeam} vs ${fixture.awayTeam} (${matchTime.toISOString()})`);
          this.activeFixturesCount--; // ✅ reduce count if skipped
          return;
        }

        this.logger.log(`📅 Scheduling live update for Fixture ${index + 1} at ${matchTime.toISOString()}`);
        const jobName = `live-update-${fixture.homeTeam}-${fixture.awayTeam}-${matchTime.getTime()}`;

        if (schedule.scheduledJobs[jobName]) {
          this.logger.warn(`⚠️ Job ${jobName} already scheduled, skipping duplicate`);
          this.activeFixturesCount--; // ✅ reduce count if duplicate
          return;
        }


        schedule.scheduleJob(jobName, scheduleTime, async () => {
          try {
            this.logger.log(`⚽ Starting live updates: ${fixture.homeTeam} vs ${fixture.awayTeam}`);
            const interval = setInterval(async () => {
              try {
                this.logger.log(`🔄 [Live] ${fixture.homeTeam} vs ${fixture.awayTeam}`);
                 await this.processFixtureLineup1(fixture);

                await this.fantazyTeamService.updateLivePlayerStatsFromApi(journee.round);

                const users = await this.userService.getAllUsers();

                for (const user of users) {

                  await this.fantazyTeamService.calculateScore(user._id.toString());
                }
              } catch (err) {
                this.logger.error(`🔥 Error in live update loop: ${err.message}`);
              }
            },20 * 1000);

            const stopDuration = 60*60*2 * 1000;
          setTimeout(async () => {
  clearInterval(interval);
  this.logger.log(`🛑 Stopped live updates: ${fixture.homeTeam} vs ${fixture.awayTeam}`);

  try {
    const lastRoundFixtures = await this.fixtureService.getFixturesOfLastRound();
    for (const fx of lastRoundFixtures) {
      await this.processCleanSheet(fx);
    }
  } catch (err) {
    this.logger.error(`🔥 Error processing clean sheets: ${err.message}`);
  }

        // ✅ Fixture finished, check if all are done
        this.activeFixturesCount--;
        if (this.activeFixturesCount === 0) {
          this.logger.log(`✅ Completed Journee ${journee.round}`);
           journee.compleated = true;
            await journee.save();

          // ⏳ For the next 1h, update stats every 10 minutes
          const updateInterval = setInterval(async () => {
            try {
              this.logger.log("🔄 Updating fantasy player stats from API...");
              await this.fantazyTeamService.updateLivePlayerStatsFromApi(journee.round);
            } catch (err) {
              this.logger.error(`🔥 Error updating fantasy stats: ${err.message}`);
            }
          },  10 * 1000); // every 10 minutes

          // ⏰ After 1 hour, stop updates and schedule next journee
          setTimeout(async () => {
                    if (this.activeFixturesCount === 0) {

            clearInterval(updateInterval);
            this.logger.log(`⏰ Scheduling Journee ${journee.round + 1} (1h after completion)`);
            await this.scheduleNextJournee();}
          }, 60 *60 * 1000); // 1 hour
        }
      }, stopDuration);

                } catch (err) {
                  this.logger.error(`🔥 Error starting scheduled live updates: ${err.message}`);
                  this.activeFixturesCount--; // ✅ make sure counter is decremented even on error
                }
              });
            });

      // ✅ If all fixtures were past/duplicates → schedule next journee
                if (this.activeFixturesCount === 0) {
                  journee.compleated = true;
                  await journee.save(); // <-- persist the change to MongoDB  this.logger.log(`✅ Completed Journee ${journee.round} — Now scheduling Journee ${journee.round + 1}`);
                  await this.scheduleNextJournee();
                }
                    } catch (err) {
                      this.logger.error(`🔥 handleCron error: ${err.message}`);
                    } finally {
                      this.isCronRunning = false;
                    }
                  }



  private async processCleanSheet(fx) {
    this.logger.log(`Processing fixture: ${fx.matchId}, ${fx.homeTeam} vs ${fx.awayTeam}`);
    if (!fx.sofamatchId || !fx.homeTeam || !fx.awayTeam) return;

    const [homeTeamDoc, awayTeamDoc] = await Promise.all([
      this.teamModel.findById(fx.homeTeam),
      this.teamModel.findById(fx.awayTeam),
    ]);

    if (!homeTeamDoc || !awayTeamDoc) return;

    const apiResponse = await this.apiService.getLiveUpdatefromsofa(
      fx.sofamatchId,
      homeTeamDoc.team_id.toString(),
      awayTeamDoc.team_id.toString(),
    );

    const homeClean = apiResponse.match_info?.teams?.home_cleancheat ?? false;
    const awayClean = apiResponse.match_info?.teams?.away_cleancheat ?? false;

    await this.updateCleanSheetStats(fx, homeClean, awayClean);
  }

  async getMockLiveScores(matchId?: string, homeCode?: string, awayCode?: string): Promise<any> {
    try {
      const finalMatchId = matchId || 'WpzcRYWi';
      const finalHomeCode = homeCode || '7600';
      const finalAwayCode = awayCode || '7611';

      const apiUrl = `http://127.0.0.1:5000/events?match_id=${finalMatchId}&home_code=${finalHomeCode}&away_code=${finalAwayCode}`;
      this.logger.log(`[getMockLiveScores] Calling API: ${apiUrl}`);

      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`API request failed with status: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      this.logger.log(`[getMockLiveScores] API response received for match ${finalMatchId}`);
      return data;
    } catch (error) {
      this.logger.error(`[getMockLiveScores] Error: ${error.message}`);
      throw error;
    }
  }

  async updateCleanSheetStats(fx, homeClean: boolean, awayClean: boolean) {
    if (homeClean) {
      const homePlayers = await this.playerModel.find({ team_id: fx.homeTeam }).exec();
      await this.applyCleanSheetPoints(homePlayers, fx.round);
    }

    if (awayClean) {
      const awayPlayers = await this.playerModel.find({ team_id: fx.awayTeam }).exec();
      await this.applyCleanSheetPoints(awayPlayers, fx.round);
    }
  }

  private async applyCleanSheetPoints(players: Player[], roundId: number) {
    for (const player of players) {

      

      const pointsToAdd = this.CLEAN_SHEET_POINTS[player.position] || 0;

      if (player._id == 337)
        {
       var stat_player =   this.playerStatModel.find({player_id:337}).exec()
            console.log("the player name id "+player.name +"its point to add is "+ pointsToAdd + "its score is "+stat_player);
          
        }
      await this.playerStatModel.updateOne(
        { round_id: roundId, player_id: player._id, cleancheat: false, isPlayed: true },
        { $set: { cleancheat: true }, $inc: { score: pointsToAdd } },
      );
    }
  }
/**
 * Process lineup for a single fixture
 */
private async processFixtureLineup(fixture: any) {
  try {
    console.log(`⚡ Processing lineup for fixture ${fixture._id} (matchId: ${fixture.matchId})`);

    // Fetch lineup from API
    const lineupResult = await this.getLineup(fixture.match_id);

    if (!lineupResult || !lineupResult.ok) {
      console.warn(`Lineup fetch failed for fixture ${fixture._id} (matchId: ${fixture.matchId})`);
      return;
    }

    console.log("✅ Enter lineup update");

    // --- Home team players ---
    for (const playerName of lineupResult.home_team_players) {
      let player = await this.findPlayerByApproxName(playerName, fixture.homeTeam.toString());

      if (!player) {
        console.warn(`❌ Home player not found in home team: ${playerName}`);
        continue; // skip if not found
      }

      await this.playerStatModel.findOneAndUpdate(
        { player_id: player._id, round_id: fixture.round },
        {
          $set: {
            isPlayed: true,
            lineupBonus: 2,
            score: 2,
          },
        },
        { upsert: true, new: true },
      );
    }

    // --- Away team players ---
    for (const playerName of lineupResult.away_team_players) {
      let player = await this.findPlayerByApproxName(playerName, fixture.awayTeam.toString());

      if (!player) {
        console.warn(`❌ Away player not found: ${playerName}`);
        continue; // skip if not found
      }

      await this.playerStatModel.findOneAndUpdate(
        { player_id: player._id, round_id: fixture.round },
        {
          $set: {
            isPlayed: true,
            lineupBonus: 2,
            score: 2,
          },
        },
        { upsert: true, new: true },
      );
    }

    // ✅ Mark fixture as lined
    fixture.Lined = true;
    await fixture.save();
    console.log(`✅ Fixture ${fixture._id} lineup processed and marked as lined.`);
  } catch (err) {
    console.error(`🔥 Error processing lineup for fixture ${fixture._id}:`, err);
  }
}



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
//--



 normalizeName1(name: string): string {
  return name
    .toLowerCase()
    .replace(/\./g, '')        // remove dots
    .replace(/\s+/g, ' ')      // collapse multiple spaces
    .trim();

  }
  
  
  async findPlayerByApproxName(apiName: string, teamId: string) {
  // Normalize API name
  const normalizedApi = this.normalizeName1(apiName);

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
private async processFixtureLineup1(fixture: any) {
  try {
    console.log(`⚡ Processing lineup for fixture ${fixture._id} (matchId: ${fixture.sofamatchId})`);

    // Fetch lineup from API
    const lineupResult = await this.apiService.getLineupsofa(fixture.sofamatchId);

    if (!lineupResult || !lineupResult.confirmed) {
      console.warn(`Lineup fetch failed or not confirmed for fixture ${fixture._id} (matchId: ${fixture.sofamatchId})`);
      return;
    }

    console.log("✅ Enter lineup update");

    // --- Home team players ---
    for (const player of lineupResult.homeTeam) {
      console.log(`🏠 Home player: ${player.name}`);

      await this.playerStatModel.findOneAndUpdate(
        { player_id: player.id, round_id: fixture.round },
        {
          $set: {
            isPlayed: true,
            lineupBonus: 2,
            score: 2,
          },
        },
        { upsert: true, new: true },
      );
    }

    // --- Away team players ---
    if (lineupResult.awayTeam) {
      for (const player of lineupResult.awayTeam) {
        console.log(`⚔️ Away player: ${player.name}`);

        await this.playerStatModel.findOneAndUpdate(
          { player_id: player.id, round_id: fixture.round },
          {
            $set: {
              isPlayed: true,
              lineupBonus: 2,
              score: 2,
            },
          },
          { upsert: true, new: true },
        );
      }
    }

    // ✅ Mark fixture as lined
    fixture.Lined = true;
    await fixture.save();
    console.log(`✅ Fixture ${fixture._id} lineup processed and marked as lined.`);
  } catch (err) {
    console.error(`🔥 Error processing lineup for fixture ${fixture._id}:`, err);
  }
}



}
