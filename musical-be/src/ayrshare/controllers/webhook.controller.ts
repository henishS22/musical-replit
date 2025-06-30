import { Controller, Post, Body, Get } from '@nestjs/common';
import { ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { UnregisterWebhookDto, WebhookDto } from '../dto/webhook.dto';
import { WebhookService } from '../services/webhook.services';

@Controller('webhook')
export class WebhookController {
  constructor(private readonly webhookService: WebhookService) { }

  @Post('/register')
  @ApiOperation({
    description: 'Register a webhook on Ayrshare',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async registerWebhook(@Body() body: WebhookDto) {
    return await this.webhookService.registerWebhook(body);
  }

  @Get()
  @ApiOperation({
    description: 'Get Ayrshare webhook list',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async listWebhooks() {
    return await this.webhookService.listWebhooks();
  }

  @Post('/unregister')
  @ApiOperation({
    description: 'Get Ayrshare webhook list',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  async unregisterWebhook(@Body() body: UnregisterWebhookDto) {
    return await this.webhookService.unregisterWebhook(body);
  }

  @Post('/handle')
  async handleWebhook(@Body() body: object) {
    return await this.webhookService.handleWebhook(body);
  }
}
