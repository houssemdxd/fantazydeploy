import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FutureFixtureService } from './future-fixture.service';
import { CreateFutureFixtureDto } from './dto/create-future-fixture.dto';
import { UpdateFutureFixtureDto } from './dto/update-future-fixture.dto';

@Controller('future-fixture')
export class FutureFixtureController {
  constructor(private readonly futureFixtureService: FutureFixtureService) {}

  @Post()
  create(@Body() createFutureFixtureDto: CreateFutureFixtureDto) {
    return this.futureFixtureService.create(createFutureFixtureDto);
  }

  @Get()
  findAll() {
    return this.futureFixtureService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.futureFixtureService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFutureFixtureDto: UpdateFutureFixtureDto) {
    return this.futureFixtureService.update(+id, updateFutureFixtureDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.futureFixtureService.remove(+id);
  }
}
