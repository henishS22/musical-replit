import { Module } from '@nestjs/common';
import { CommunityForumController } from './community-forum.controller';
import { CommunityForumService } from './community-forum.service';
import { SchemasModule } from '../schemas/schemas.module';
import { MongooseModule } from '@nestjs/mongoose';
import { Comment, CommentSchema } from '../schemas/schemas/comment.schema';
import { Topic, TopicSchema } from '../schemas/schemas/topic.schema';

@Module({
   imports: [SchemasModule,MongooseModule.forFeature([{ name: Comment.name, schema: CommentSchema }, { name: Topic.name, schema: TopicSchema }])],
  controllers: [CommunityForumController],
  providers: [CommunityForumService]
})
export class CommunityForumModule {}
