import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class FutureFixture extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  homeKey: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  awayKey: Types.ObjectId;

  @Prop({ required: true })
  date: Date; // match date

  @Prop({ type: Types.ObjectId, ref: 'Journee' })
  journee: Types.ObjectId; // back-reference
}

export const FutureFixtureSchema = SchemaFactory.createForClass(FutureFixture);
