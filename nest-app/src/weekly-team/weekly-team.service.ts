import { Injectable } from '@nestjs/common';
import { CreateWeeklyTeamDto } from './dto/create-weekly-team.dto';
import { UpdateWeeklyTeamDto } from './dto/update-weekly-team.dto';

@Injectable()
export class WeeklyTeamService {
  create(createWeeklyTeamDto: CreateWeeklyTeamDto) {
    return 'This action adds a new weeklyTeam';
  }

  findAll() {
    return `This action returns all weeklyTeam`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weeklyTeam`;
  }

  update(id: number, updateWeeklyTeamDto: UpdateWeeklyTeamDto) {
    return `This action updates a #${id} weeklyTeam`;
  }

  remove(id: number) {
    return `This action removes a #${id} weeklyTeam`;
  }
}
