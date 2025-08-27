import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { JourneeService } from './journee.service';
import { CreateJourneeDto } from './dto/create-journee.dto';
import { UpdateJourneeDto } from './dto/update-journee.dto';

@Controller('journee')
export class JourneeController {
  constructor(private readonly journeeService: JourneeService) {}

  @Post()
  create(@Body() createJourneeDto: CreateJourneeDto) {
    return this.journeeService.create(createJourneeDto);
  }

  @Get()
  findAll() {
    return this.journeeService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.journeeService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateJourneeDto: UpdateJourneeDto) {
    return this.journeeService.update(+id, updateJourneeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.journeeService.remove(+id);
  }
}
