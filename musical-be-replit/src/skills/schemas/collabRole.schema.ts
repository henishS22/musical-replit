import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

export type CollabRoleDocument = CollabRole & Document;

@Schema()
export class CollabRole {
    @Prop({ required: true, type: { en: String, es: String } })
    title: { en: string; es: string };

    @Prop({ required: true, })
    type: string

}

export const CollabRoleSchema = SchemaFactory.createForClass(CollabRole);