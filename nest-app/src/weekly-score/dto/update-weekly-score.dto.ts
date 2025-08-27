import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyScoreDto } from './create-weekly-score.dto';

export class UpdateWeeklyScoreDto extends PartialType(CreateWeeklyScoreDto) {}
