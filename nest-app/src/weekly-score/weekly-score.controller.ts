import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeeklyScoreService } from './weekly-score.service';
import { CreateWeeklyScoreDto } from './dto/create-weekly-score.dto';
import { UpdateWeeklyScoreDto } from './dto/update-weekly-score.dto';

@Controller('weekly-score')
export class WeeklyScoreController {
  constructor(private readonly weeklyScoreService: WeeklyScoreService) {}

  @Post()
  create(@Body() createWeeklyScoreDto: CreateWeeklyScoreDto) {
    return this.weeklyScoreService.create(createWeeklyScoreDto);
  }

  @Get()
  findAll() {
    return this.weeklyScoreService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weeklyScoreService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeeklyScoreDto: UpdateWeeklyScoreDto) {
    return this.weeklyScoreService.update(+id, updateWeeklyScoreDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weeklyScoreService.remove(+id);
  }
}
