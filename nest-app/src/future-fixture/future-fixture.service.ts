import { Injectable } from '@nestjs/common';
import { CreateFutureFixtureDto } from './dto/create-future-fixture.dto';
import { UpdateFutureFixtureDto } from './dto/update-future-fixture.dto';

@Injectable()
export class FutureFixtureService {
  create(createFutureFixtureDto: CreateFutureFixtureDto) {
    return 'This action adds a new futureFixture';
  }

  findAll() {
    return `This action returns all futureFixture`;
  }

  findOne(id: number) {
    return `This action returns a #${id} futureFixture`;
  }

  update(id: number, updateFutureFixtureDto: UpdateFutureFixtureDto) {
    return `This action updates a #${id} futureFixture`;
  }

  remove(id: number) {
    return `This action removes a #${id} futureFixture`;
  }
}
