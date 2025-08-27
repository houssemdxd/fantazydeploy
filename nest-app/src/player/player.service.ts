import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Player } from './entities/player.entity';
import { CreatePlayerDto } from './dto/create-player.dto';
import { UpdatePlayerDto } from './dto/update-player.dto';

@Injectable()
export class PlayerService {
  constructor(
    @InjectModel('Player') private readonly playerModel: Model<Player>,
  ) {}

  // ✅ Create a new player
  async create(createPlayerDto: CreatePlayerDto): Promise<Player> {
    const createdPlayer = new this.playerModel(createPlayerDto);
    return createdPlayer.save();
  }

  // ✅ Get all players
  async findAll(): Promise<Player[]> {
    return this.playerModel.find().exec();
  }

  // ✅ Get one player by ID
  async findOne(id: number): Promise<Player> {
    const player = await this.playerModel.findOne({ _id: id }).exec();
    if (!player) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }
    return player;
  }
async findByTeam(teamId: string): Promise<Player[]> {
  const objectId = new Types.ObjectId(teamId);
  return this.playerModel.find({ team_id: objectId }).exec();
}

  // ✅ Update player
  async update(id: number, updatePlayerDto: UpdatePlayerDto): Promise<Player> {
    const updatedPlayer = await this.playerModel
      .findOneAndUpdate({ _id: id }, updatePlayerDto, {
        new: true,
        runValidators: true,
      })
      .exec();

    if (!updatedPlayer) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    return updatedPlayer;
  }

  // ✅ Remove player
  async remove(id: number): Promise<Player> {
    const deletedPlayer = await this.playerModel
      .findOneAndDelete({ _id: id })
      .exec();

    if (!deletedPlayer) {
      throw new NotFoundException(`Player with ID ${id} not found`);
    }

    return deletedPlayer;
  }

  // ✅ Optional: Add price to players missing it
  async addDefaultPriceToAll(price = 6.5): Promise<any> {
    return this.playerModel.updateMany(
      { price: { $exists: false } },
      { $set: { price } },
    );
  }
}
