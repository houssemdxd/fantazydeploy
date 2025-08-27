import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Fixture extends Document {
  
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  homeTeam: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  awayTeam: Types.ObjectId;

  
@Prop({ type: Types.ObjectId, ref: 'Round' })
  round: Types.ObjectId;

  @Prop({ required: true })
  eventTime: string;

  @Prop({ required: true })
  date: string;

  @Prop({ required: false })
  league: string;

  
  @Prop({ default: false })
  Lined: boolean;

  @Prop({ required: false })
  event_status: string;

  @Prop({ default: false })
  cleancheat: boolean;

  @Prop({ default: "" ,required: false})
  matchId: string;

  @Prop({ default: "" ,required: false})
  sofamatchId: string;

}

export const FixtureSchema = SchemaFactory.createForClass(Fixture);
