import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RoundDocument = Round & Document;

@Schema()
export class Round {
  @Prop({ required: true })
  roundNumber: number;
@Prop({ type: Date, default: Date.now }) // ✅ Automatically sets creation date
  createdAt: Date;
}

export const RoundSchema = SchemaFactory.createForClass(Round);
