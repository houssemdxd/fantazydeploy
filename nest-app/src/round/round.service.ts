import { Injectable } from '@nestjs/common';
import { CreateRoundDto } from './dto/create-round.dto';
import { UpdateRoundDto } from './dto/update-round.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Round, RoundDocument } from './entities/round.entity';
import { Model } from 'mongoose';

@Injectable()
export class RoundService {
   constructor(
    @InjectModel(Round.name) private roundModel: Model<RoundDocument>,
  ) {}


  async getLaastround(): Promise<Round>
  {
    const currentRound1 = await this.roundModel.findOne().sort({ roundNumber: -1 });
    return currentRound1
  }
async createRound(): Promise<Round> {
  const lastRound = await this.roundModel.findOne().sort({ roundNumber: -1 }).exec();
  const nextRoundNumber = lastRound ? lastRound.roundNumber + 1 : 1;

  // Get only date (no time) for today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Step 1: Use upsert to avoid duplicates
  const newRound = await this.roundModel.findOneAndUpdate(
    { roundNumber: nextRoundNumber },
    {
      $setOnInsert: {
        roundNumber: nextRoundNumber,
        date: today // 👈 storing only the date part
      }
    },
    { new: true, upsert: true }
  ).exec();

  // Step 2: Check for duplicates and remove them if found
  const allRoundsWithSameNumber = await this.roundModel.find({ roundNumber: nextRoundNumber }).exec();

  if (allRoundsWithSameNumber.length > 1) {
    // Keep the one we just created/returned, delete the others
    const roundsToDelete = allRoundsWithSameNumber.filter(r => r._id.toString() !== newRound._id.toString());
    const idsToDelete = roundsToDelete.map(r => r._id);

    await this.roundModel.deleteMany({ _id: { $in: idsToDelete } });

    console.warn(`⚠️ Found and deleted ${idsToDelete.length} duplicate rounds with roundNumber ${nextRoundNumber}`);
  }

  return newRound;
}


  findAll() {
    return `This action returns all round`;
  }

  findOne(id: number) {
    return `This action returns a #${id} round`;
  }

  update(id: number, updateRoundDto: UpdateRoundDto) {
    return `This action updates a #${id} round`;
  }

  remove(id: number) {
    return `This action removes a #${id} round`;
  }
}
