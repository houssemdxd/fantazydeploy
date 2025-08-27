import { Injectable } from '@nestjs/common';
import { CreatePlayerStatDto } from './dto/create-player-stat.dto';
import { UpdatePlayerStatDto } from './dto/update-player-stat.dto';
import { InjectModel } from '@nestjs/mongoose';
import { PlayerStat } from './entities/player-stat.entity';
import { Model } from 'mongoose';
import { Player } from 'src/player/entities/player.entity';
import { Round } from 'src/round/entities/round.entity';

@Injectable()
export class PlayerStatsService {

 constructor(
    @InjectModel(PlayerStat.name) private playerStatModel: Model<PlayerStat>,
    @InjectModel(Player.name) private playerModel: Model<Player>,
    @InjectModel(Round.name) private roundModel: Model<Round>,
  ) {}


async deleteDuplicateStatsForLastRound(): Promise<void> {
  // 1️⃣ Find the last round
  const lastRound = await this.roundModel.findOne().sort({ roundNumber: -1 }).exec();
  if (!lastRound) {
    console.log("No rounds found.");
    return;
  }

  const roundId = lastRound._id;

  // 2️⃣ Get all player stats for the last round
  const stats = await this.playerStatModel.find({ round_id: roundId }).exec();

  // 3️⃣ Track duplicates
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const stat of stats) {
    const key = stat.player_id.toString();
    if (seen.has(key)) {
      duplicates.push(stat._id.toString());
    } else {
      seen.add(key);
    }
  }

  // 4️⃣ Delete duplicates
  if (duplicates.length > 0) {
    await this.playerStatModel.deleteMany({ _id: { $in: duplicates } });
    console.log(`Deleted ${duplicates.length} duplicate stats for last round.`);
  } else {
    console.log("No duplicate stats found for last round.");
  }
}
async generateRandomStatsForLastRound(): Promise<void> {
  // Get the latest round by created date or round number
  const lastRound = await this.roundModel.findOne().sort({ roundNumber: -1 }).exec();
  if (!lastRound) {
    console.log('No rounds found.');
    return;
  }

  console.log("🎯 Last round found:", lastRound.roundNumber);

  const players = await this.playerModel.find();

  for (const player of players) {
    // Check if a stat already exists for this player in this round
    const existingStat = await this.playerStatModel.findOne({
      player_id: player._id,
      round_id: lastRound._id
    });

    if (existingStat) {
    //  console.log(`⏭️ Skipping player ${player._id} — already has stats for round ${lastRound.roundNumber}`);
      continue; // skip this player
    }

    const score = 0; // You can randomize if needed
    await this.playerStatModel.create({
      player_id: player._id,
      round_id: lastRound._id,
      score,
    });

    //console.log(`✅ Created stats for player ${player._id} in round ${lastRound.roundNumber}`);
  }

  console.log(`🎉 Stats generation completed for Round ${lastRound.roundNumber}`);
}


  create(createPlayerStatDto: CreatePlayerStatDto) {
    return 'This action adds a new playerStat';
  }

  findAll() {
    return `This action returns all playerStats`;
  }

  findOne(id: number) {
    return `This action returns a #${id} playerStat`;
  }

  update(id: number, updatePlayerStatDto: UpdatePlayerStatDto) {
    return `This action updates a #${id} playerStat`;
  }

  remove(id: number) {
    return `This action removes a #${id} playerStat`;
  }
}
