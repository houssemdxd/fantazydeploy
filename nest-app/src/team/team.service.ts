import { Injectable } from '@nestjs/common';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Team,TeamSchema } from './entities/team.entity';

@Injectable()
export class TeamService {

  constructor(
    @InjectModel(Team.name) private teamModel: Model<Team>,
  ) {}
  create(createTeamDto: CreateTeamDto) {
    return 'This action adds a new team';
  }

   async findAll(): Promise<Team[]> {
    return this.teamModel.find().exec();
  }


  findOne(id: number) {
    return `This action returns a #${id} team`;
  }

  update(id: number, updateTeamDto: UpdateTeamDto) {
    return `This action updates a #${id} team`;
  }

  remove(id: number) {
    return `This action removes a #${id} team`;
  }
}
