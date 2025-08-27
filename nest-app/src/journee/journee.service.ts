import { Injectable } from '@nestjs/common';
import { CreateJourneeDto } from './dto/create-journee.dto';
import { UpdateJourneeDto } from './dto/update-journee.dto';

@Injectable()
export class JourneeService {
  create(createJourneeDto: CreateJourneeDto) {
    return 'This action adds a new journee';
  }

  findAll() {
    return `This action returns all journee`;
  }

  findOne(id: number) {
    return `This action returns a #${id} journee`;
  }

  update(id: number, updateJourneeDto: UpdateJourneeDto) {
    return `This action updates a #${id} journee`;
  }

  remove(id: number) {
    return `This action removes a #${id} journee`;
  }
}
