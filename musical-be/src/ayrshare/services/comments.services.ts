import { Injectable } from '@nestjs/common';
import { AyrshareService } from '../ayrshare.service';
import { PostCommentDto, ReplyToCommentDto } from '../dto/comments.dto';

@Injectable()
export class CommentsService {
  constructor(private readonly ayrshareService: AyrshareService) {}

  async postComment(owner: string, body: PostCommentDto) {
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const endpoint = `/api/comments`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'POST',
        body,
        profile.ayrshare.profile.profileKey,
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message);
    }
  }

  async getComments(owner: string, id: string) {
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const endpoint = `/api/comments/${id}`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'GET',
        {},
        profile.ayrshare.profile.profileKey,
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message);
    }
  }

  async deleteComment(owner: string, id: string, platforms: string[]) {
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const endpoint = `/api/comments/${id}`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'DELETE',
        { platforms },
        profile.ayrshare.profile.profileKey,
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message);
    }
  }

  async replyToComment(owner: string, id: string, body: ReplyToCommentDto) {
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const endpoint = `/api/comments/reply/${id}`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'POST',
        body,
        profile.ayrshare.profile.profileKey,
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message);
    }
  }
}
