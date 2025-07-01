import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type TagDocument = Tag & Document;

@Schema()
export class Tag {
  @Prop({ required: true, type: { en: String, es: String } })
  title: { en: string; es: string };

  @Prop({ required: true, })
  definition: string;
}

export const TagSchema = SchemaFactory.createForClass(Tag);
