import { Injectable } from '@nestjs/common';
import { AyrshareService } from '../ayrshare.service';
import { SendMessageDto } from '../dto/message.dto';

@Injectable()
export class MessageService {
  constructor(private readonly ayrshareService: AyrshareService) {}

  async getMessages(owner: string, platform: string, conversationsOnly: string, conversationId: string) {
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    let endpoint = `/api/messages/${platform}`;
    if (conversationsOnly) endpoint = `${endpoint}?conversationsOnly=${conversationsOnly}`;
    if (conversationId) endpoint = `${endpoint}?conversationId=${conversationId}`;
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

  async sendMessage(owner: string, platform: string, body: SendMessageDto) {
    const profile = await this.ayrshareService.checkForAyrshareProfile(owner);
    const endpoint = `/api/messages/${platform}`;
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
