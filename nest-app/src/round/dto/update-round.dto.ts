import { PartialType } from '@nestjs/mapped-types';
import { CreateRoundDto } from './create-round.dto';

export class UpdateRoundDto extends PartialType(CreateRoundDto) {}
