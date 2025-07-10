import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type RegisterDocument = Register & Document;

@Schema({ timestamps: true })
export class Register {
  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    required: false,
  })
  firstName: string;

  @Prop({
    required: false,
  })
  lastName: string;

  @Prop({
    required: false,
  })
  title: string;

  @Prop({
    required: false,
  })
  business: string;
  @Prop({
    required: false,
  })
  company: string;

  @Prop({
    required: false,
  })
  comments: string;
}

export const RegisterSchema = SchemaFactory.createForClass(Register);
