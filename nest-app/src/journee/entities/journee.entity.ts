import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { FutureFixture } from '../../future-fixture/entities/future-fixture.entity';

@Schema({ timestamps: true })
export class Journee extends Document {
  @Prop({ required: true })
  round: number;

  @Prop({ required: true })
  date: Date; // beginning of the round
    @Prop({ type: Boolean, default: false })
  compleated :boolean
  // One-to-Many with FutureFixture
  @Prop({ type: [{ type: Types.ObjectId, ref: 'FutureFixture' }] })
  fixtures: FutureFixture[];
}

export const JourneeSchema = SchemaFactory.createForClass(Journee);
