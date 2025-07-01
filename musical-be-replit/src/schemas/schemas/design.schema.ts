import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type DesignDocument = Design & Document;

@Schema({ timestamps: true })
export class Design {
  @Prop()
  title: string;
}

export const DesignSchema = SchemaFactory.createForClass(Design);
