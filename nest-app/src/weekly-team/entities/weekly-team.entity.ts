import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FantasyTeam } from 'src/fantasy-team/entities/fantasy-team.entity';
import { Round } from 'src/round/entities/round.entity';

export type WeeklyTeamDocument = WeeklyTeam & Document;
@Schema({ timestamps: true }) // Add this

@Schema()
export class WeeklyTeam {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  user_id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Round', required: true })
  round: Types.ObjectId | Round;


  @Prop({ default: 2 })
  nb_transfert: number;

  @Prop({ default: 0 })
  score: number;
}

export const WeeklyTeamSchema = SchemaFactory.createForClass(WeeklyTeam);
