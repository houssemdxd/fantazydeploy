import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Team extends Document {
  @Prop({ required: true, unique: true })
  team_id: number; // Custom ID from API


 @Prop({ required: true, unique: true })
  team_sofa_id: number; // Custom ID from API


  
  @Prop({ required: true })
  name: string;

  @Prop()
  logo: string;
}

export const TeamSchema = SchemaFactory.createForClass(Team);
