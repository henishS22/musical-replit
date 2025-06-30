import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { Document } from 'mongoose';
import * as mongoose from 'mongoose';

export type CreatorQuestDocument = CreatorQuest & Document;

class MetaData {
    @IsString()
    @IsOptional()
    @Prop()
    caption?: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Prop({ type: [String] })
    mentions?: string[];

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    @Prop({ type: [String] })
    hashtags?: string[];
}

@Schema({ _id: false }) // Prevents Mongo from creating a separate _id for nested schema
class MetaDataSchemaClass extends MetaData { }

const MetaDataSchema = SchemaFactory.createForClass(MetaDataSchemaClass);

@Schema({ timestamps: true })
export class CreatorQuest {
    @Prop({ default: true })
    isActive: boolean;

    @Prop({ default: false })
    isPublished: boolean;

    @Prop()
    isPublishByAdmin: boolean;

    @Prop()
    identifier: string;

    @Prop()
    description: string;

    @ValidateNested()
    @Type(() => MetaData)
    @Prop({ type: MetaDataSchema })
    metaData: MetaData;

    @Prop({ required: true, type: mongoose.Schema.Types.ObjectId, ref: 'Quest' })
    questId: string;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    userId: string;
}

export const CreatorQuestSchema = SchemaFactory.createForClass(CreatorQuest);