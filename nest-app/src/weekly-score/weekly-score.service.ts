import { Injectable } from '@nestjs/common';
import { CreateWeeklyScoreDto } from './dto/create-weekly-score.dto';
import { UpdateWeeklyScoreDto } from './dto/update-weekly-score.dto';

@Injectable()
export class WeeklyScoreService {
  create(createWeeklyScoreDto: CreateWeeklyScoreDto) {
    return 'This action adds a new weeklyScore';
  }

  findAll() {
    return `This action returns all weeklyScore`;
  }

  findOne(id: number) {
    return `This action returns a #${id} weeklyScore`;
  }

  update(id: number, updateWeeklyScoreDto: UpdateWeeklyScoreDto) {
    return `This action updates a #${id} weeklyScore`;
  }

  remove(id: number) {
    return `This action removes a #${id} weeklyScore`;
  }
}
