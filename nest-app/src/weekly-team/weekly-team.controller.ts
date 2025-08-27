import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { WeeklyTeamService } from './weekly-team.service';
import { CreateWeeklyTeamDto } from './dto/create-weekly-team.dto';
import { UpdateWeeklyTeamDto } from './dto/update-weekly-team.dto';

@Controller('weekly-team')
export class WeeklyTeamController {
  constructor(private readonly weeklyTeamService: WeeklyTeamService) {}

  @Post()
  create(@Body() createWeeklyTeamDto: CreateWeeklyTeamDto) {
    return this.weeklyTeamService.create(createWeeklyTeamDto);
  }

  @Get()
  findAll() {
    return this.weeklyTeamService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.weeklyTeamService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateWeeklyTeamDto: UpdateWeeklyTeamDto) {
    return this.weeklyTeamService.update(+id, updateWeeklyTeamDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.weeklyTeamService.remove(+id);
  }
}
