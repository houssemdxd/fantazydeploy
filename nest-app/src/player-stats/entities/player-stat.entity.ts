import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class PlayerStat extends Document {
  @Prop({ type: Number, required: true })
  player_id: number;

  @Prop({ type: Types.ObjectId, ref: 'Round', required: true })
  round_id: Types.ObjectId;

  @Prop({ type: Boolean, default: false })
  redCard: boolean;

  @Prop({ type: Boolean, default: false })
  yellowCard: boolean;

  @Prop({ type: Number, default: 0 })
  goals: number;

  @Prop({ type: Boolean, default: false })
  substituted: boolean;

  @Prop({ type: Boolean, default: false })
  isPlayed: boolean;

@Prop({ type: Number, default: 0})
  assist: number;

  @Prop({ type: Number, default: 2 })
  lineupBonus: number;

    
  @Prop({ type: Boolean, default: false })
  start :boolean

  @Prop({ type: Boolean, default: false })
  cleancheat :boolean

  @Prop({ type: Number, default: 0 })
  score: number;
}

export const PlayerStatSchema = SchemaFactory.createForClass(PlayerStat);
