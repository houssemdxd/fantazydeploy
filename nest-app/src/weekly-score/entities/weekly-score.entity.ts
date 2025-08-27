import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { User } from 'src/auth/schemas/user.schema';
import { Round } from 'src/round/entities/round.entity';


@Schema({ timestamps: true })
export class WeeklyScore extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Round', required: true })
  round: Types.ObjectId | Round;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user: Types.ObjectId | User;

  @Prop({ type: Number, required: true })
  score: number;
}

export const WeeklyScoreSchema = SchemaFactory.createForClass(WeeklyScore);

