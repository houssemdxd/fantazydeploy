import { PartialType } from '@nestjs/mapped-types';
import { CreateWeeklyTeamDto } from './create-weekly-team.dto';

export class UpdateWeeklyTeamDto extends PartialType(CreateWeeklyTeamDto) {}
