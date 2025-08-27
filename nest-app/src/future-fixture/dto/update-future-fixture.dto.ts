import { PartialType } from '@nestjs/mapped-types';
import { CreateFutureFixtureDto } from './create-future-fixture.dto';

export class UpdateFutureFixtureDto extends PartialType(CreateFutureFixtureDto) {}
