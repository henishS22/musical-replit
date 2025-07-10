import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Comment, CommentDocument } from '../schemas/schemas/comment.schema';
import { Topic, TopicDocument } from '../schemas/schemas/topic.schema';
import { Forum, ForumDocument } from '../schemas/schemas/forum.schema';
import { CreateForumDto } from './dto/forum.dto';
import { ObjectId } from 'mongodb';
@Injectable()
export class CommunityForumService {
  constructor(
    @InjectModel(Comment.name) private commentModel: Model<CommentDocument>,
    @InjectModel(Topic.name) private topicModel: Model<TopicDocument>,
    @InjectModel(Forum.name) private forumModel: Model<ForumDocument>,
  ) { }

  //Topics service method

  async createTopic(
    userId: string,
    title: string,
    forumId: string,
    description: string,
  ): Promise<Topic> {
    const topic = new this.topicModel({
      userId,
      title,
      forumId,
      description,
    });
    return topic.save();
  }

  async getAllTopics(): Promise<Topic[]> {
    return this.topicModel
      .find().sort({ createdAt: -1 })
      .populate('forumId', 'name')
      .populate('userId', 'name profile_img')
      .populate('lastReplyFrom', 'name profile_img')
      .exec();
  }

  async getTopicById(topicId: string): Promise<any> {
    const topic = await this.topicModel
      .findById(topicId)
      .populate({
        path: 'comments',
        populate: [
          { path: 'userId', select: 'name profile_img' }, // Populate user details for comments
          {
            path: 'replies',
            populate: { path: 'userId', select: 'name profile_img' }, // Populate user details for replies
            select: 'content userId createdAt',
          },
        ],
      })
      .populate('forumId', 'name')
      .populate('lastReplyFrom', 'name profile_img')
      .populate('userId', 'name profile_img')
      .lean();

    if (!topic) throw new NotFoundException('Topic not found');

    // Increment view count separately (since topic is now plain object)
    await this.topicModel.findByIdAndUpdate(topicId, {
      $inc: { viewCount: 1 },
    });

    return {
      _id: topic._id,
      title: topic.title,
      forumId: topic.forumId,
      description: topic.description,
      viewCount: topic.viewCount, // Ensure updated count is returned
      participants: topic.participants,
      repliesCount: topic.repliesCount,
      lastActivity: topic.lastActivity,
      lastReplyFrom: topic.lastReplyFrom,
      userId: topic.userId,
      comments: topic.comments.map((comment: any) => ({
        _id: comment._id,
        content: comment.content,
        userId: comment.userId,
        replies: comment.replies.map((reply: any) => ({
          _id: reply._id,
          content: reply.content,
          userId: reply.userId,
          createdAt: reply.createdAt,
        })), // Extract reply content as string
        createdAt: comment.createdAt,
      })),
      createdAt: topic.createdAt,
    };
  }

  // Search Topics by Title or Forum Name
  async searchTopics(query: string): Promise<Topic[]> {
    return this.topicModel
      .find({
        $or: [
          { title: { $regex: query, $options: 'i' } }, // Case-insensitive title search
          { forumName: { $regex: query, $options: 'i' } }, // Case-insensitive forum search
        ],
      })
      .populate('comments')
      .populate('forumId', 'name')
      .populate('lastReplyFrom', 'name profile_img')
      .populate('userId', 'name profile_img');
  }

  //comment service method
  async addComment(
    topicId: string,
    content: string,
    userId: string,
    parentCommentId?: string,
  ): Promise<Comment> {
    const topic = await this.topicModel.findById(topicId);
    if (!topic) throw new NotFoundException('Topic not found');

    const comment = new this.commentModel({
      content,
      topic: topicId,
      userId,
      parentComment: parentCommentId,
    });

    if (parentCommentId) {
      const parentComment = await this.commentModel.findById(parentCommentId);
      if (!parentComment)
        throw new NotFoundException('Parent comment not found');
      parentComment.replies.push(comment._id);
      await parentComment.save();
    } else {
      topic.comments.push(comment._id);
    }

    // Update topic details
    if (!topic.participants.includes(userId)) {
      topic.participants.push(userId);
    }
    topic.repliesCount += 1;
    topic.lastActivity = new Date();
    topic.lastReplyFrom = userId;
    await topic.save();

    return comment.save();
  }

  // ✅ Edit Comment
  async updateComment(commentId: string, content: string): Promise<Comment> {
    const comment = await this.commentModel.findByIdAndUpdate(
      commentId,
      { content },
      { new: true }, // Return updated comment
    );

    if (!comment) throw new NotFoundException('Comment not found');
    return comment;
  }

  async deleteComment(commentId: string): Promise<string> {
    const comment = await this.commentModel.findById(commentId);
    if (!comment) throw new NotFoundException('Comment not found');

    if (comment.parentComment) {
      // If it's a reply, remove it from parent comment
      const parentComment = await this.commentModel.findById(
        comment.parentComment,
      );
      if (parentComment) {
        parentComment.replies = parentComment.replies.filter(
          (replyId) => replyId.toString() !== commentId,
        );
        await parentComment.save();
      }
    } else {
      // If it's a top-level comment, remove from topic
      const topic = await this.topicModel.findById(comment.topic);
      if (topic) {
        topic.comments = topic.comments.filter(
          (cmtId) => cmtId.toString() !== commentId,
        );
        topic.repliesCount -= 1;
        await topic.save();
      }
    }

    await this.commentModel.findByIdAndDelete(commentId);
    return 'Comment deleted successfully';
  }

  //forum
  async createForum(createForumDto: CreateForumDto): Promise<Forum> {
    const createdForum = new this.forumModel({
      ...createForumDto,
    });
    return createdForum.save();
  }

  async findAllForum(): Promise<Forum[]> {
    return this.forumModel.find().sort({ createdAt: 1 }).exec();
  }

  //update topics
  async updateTopic(userId: string, title: string, forumId: string, description: string, topicId: string,) {
    const topic = await this.topicModel.findOneAndUpdate(
      { userId: userId, _id: topicId },
      { title, forumId, description },
      { new: true },
    );

    if (!topic) throw new NotFoundException('Topic not found');
    return topic;
  }

  //update topics
  async deleteTopic(userId: string, topicId: string,) {
    const topic = await this.topicModel.findOne({ userId, _id: topicId });
    if (!topic) throw new NotFoundException('Topic not found');

    // Delete all comments related to the topic
    await this.commentModel.deleteMany({ topic: topicId });

    // Delete the topic
    await this.topicModel.deleteOne({ _id: topicId });

    return { message: 'Topic deleted successfully' };
  }
}
