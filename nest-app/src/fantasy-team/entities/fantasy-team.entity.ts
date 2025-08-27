// fantasy-team.entity.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { WeeklyTeam } from 'src/weekly-team/entities/weekly-team.entity';

@Schema()
export class FantasyTeam extends Document {


  @Prop({ type: Number, ref: 'Player', required: true })
  player_id: number;

  @Prop({ default: false })
  isCaptain: boolean;

 @Prop({ type: Types.ObjectId, ref: 'WeeklyTeam', required: true })
  WeeklyTeam: Types.ObjectId | WeeklyTeam;


  @Prop({ default: false })
  isViceCaptain: boolean;

  @Prop({ default: false })
  isBench: boolean;
}

export const FantasyTeamSchema = SchemaFactory.createForClass(FantasyTeam);
