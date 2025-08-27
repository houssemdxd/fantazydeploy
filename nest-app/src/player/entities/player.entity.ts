import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema()
export class Player extends Document {
  @Prop({ required: true })
  _id: number;

  @Prop({ required: true })
  name: string;

  @Prop()
  image?: string;

  @Prop({ required: true, enum: ['Goalkeepers', 'Defenders', 'Midfielders', 'Forwards'] })
  position: string;
@Prop({ required: true, default: 6.5 }) // NEW FIELD
  price: number;
  @Prop({ type: Types.ObjectId, ref: 'Team', required: true })
  team_id: Types.ObjectId;


}

export const PlayerSchema = SchemaFactory.createForClass(Player);