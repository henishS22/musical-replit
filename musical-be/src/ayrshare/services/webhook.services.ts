import { Injectable } from '@nestjs/common';
import { AyrshareService } from '../ayrshare.service';
import { UnregisterWebhookDto, WebhookDto } from '../dto/webhook.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Post } from '@/src/schemas/schemas';
import { Model } from 'mongoose';

@Injectable()
export class WebhookService {
  constructor(
    private readonly ayrshareService: AyrshareService,
    @InjectModel(Post.name) private postModel: Model<Post>,
  ) { }

  async registerWebhook(body: WebhookDto) {
    const endpoint = `/api/hook/webhook`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'POST',
        body,
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message);
    }
  }

  async listWebhooks() {
    const endpoint = `/api/hook/webhook`;
    try {
      const response = await this.ayrshareService.apiRequest(endpoint, 'GET');
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message);
    }
  }

  async unregisterWebhook(body: UnregisterWebhookDto) {
    const endpoint = `/api/hook/webhook`;
    try {
      const response = await this.ayrshareService.apiRequest(
        endpoint,
        'DELETE',
        body,
      );
      return response.data;
    } catch (err) {
      throw new Error(err.response?.data?.message ?? err.message);
    }
  }

  async handleWebhook(body: object) {
    // Process webhook event
    const postDetails = await this.postModel.findOne({ id: body['id'] })
    if (postDetails) {
      if (body['action'] === 'scheduled') {
        postDetails.status = body['status']
        postDetails.errors = body['errors']
        postDetails.postIds = body['postIds']
        await postDetails.save()
      }

    }
    return;
  }
}
