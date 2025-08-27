import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RoundService } from './round.service';
import { CreateRoundDto } from './dto/create-round.dto';
import { UpdateRoundDto } from './dto/update-round.dto';

@Controller('round')
export class RoundController {
  constructor(private readonly roundService: RoundService) {}

  @Post()
  create() {
    return this.roundService.createRound();
  }

  @Get()
  findAll() {
    return this.roundService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roundService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRoundDto: UpdateRoundDto) {
    return this.roundService.update(+id, updateRoundDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.roundService.remove(+id);
  }
}
