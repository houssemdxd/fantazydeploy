import { PartialType } from '@nestjs/mapped-types';
import { CreateJourneeDto } from './create-journee.dto';

export class UpdateJourneeDto extends PartialType(CreateJourneeDto) {}
