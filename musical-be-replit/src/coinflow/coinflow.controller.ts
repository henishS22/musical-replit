import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Headers,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
// import { createRegisterDto } from './dto/createRegister.dto';

// Services Imports
import { CoinflowService } from './coinflow.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import coinflowHelper from './helper/coinflow.helper';

@Controller('coinflow')
@ApiTags('coinflow')
export class CoinflowController {
  constructor(private readonly coinflowService: CoinflowService) { }

  @UseGuards(JwtAuthGuard)
  @Get('subscription-plans')
  @ApiOperation({
    summary: 'Get the coinflow subscription plans',
  })
  @ApiOkResponse({
    description: 'Coinflow subscription plans fetch successfully',
  })
  @ApiBadRequestResponse({
    description:
      'The subscription plans not fetched due to invalid request data',
  })
  async getSubscriptionPlans() {
    const subscriptions = await this.coinflowService.getSubscriptions();
    return subscriptions;
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription-addons')
  @ApiOperation({
    summary: 'Get the coinflow subscription addons',
  })
  @ApiOkResponse({
    description: 'Coinflow subscription addons fetch successfully',
  })
  @ApiBadRequestResponse({
    description:
      'The subscription addons not fetched due to invalid request data',
  })
  async getSubscriptionAddons() {
    const subscriptionAddons =
      await this.coinflowService.getSubscriptionAddons();
    return subscriptionAddons;
  }

  @UseGuards(JwtAuthGuard)
  @Get('subscription-detail/:id')
  @ApiOperation({
    summary: 'Get the coinflow subscription plan',
  })
  @ApiOkResponse({
    description: 'Coinflow subscription detail fetch successfully',
  })
  @ApiBadRequestResponse({
    description:
      'The subscription detail not fetched due to invalid request data',
  })
  async getSubscriptionDetail(@Param('id') id: string) {
    const subscription = await this.coinflowService.getSubscriptionDetail(id);
    return subscription;
  }

  @UseGuards(JwtAuthGuard)
  @Post('cancel-subscription')
  @ApiOperation({
    summary: 'Cancel the subscription',
  })
  @ApiOkResponse({
    description: 'Subscription canceled successfully.',
  })
  @ApiBadRequestResponse({
    description: 'The subscription not canceled due to invalid request data',
  })
  async cancelSubscription(
    @Body('id') id: string,
    @Body('wallet') wallet: string,
  ) {
    const response = await coinflowHelper.cancelSubscription({
      id,
      wallet,
    });
    if (response.status == 200) {
      await this.coinflowService.cancelSubscription({ id, wallet });
    }
    return {
      success: true,
    };
  }

  @Post('subscription-webhook')
  @ApiOperation({
    summary: 'Handle Coinflow subscription webhook',
    description:
      'Process webhook events from Coinflow for subscription updates',
  })
  @ApiOkResponse({
    description: 'Webhook processed successfully',
  })
  @ApiBadRequestResponse({
    description: 'Invalid webhook payload',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid webhook signature',
  })
  async subscriptionWebhook(
    @Body() data: any,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      // Validate webhook signature
      if (authHeader !== process.env.COINFLOW_VALIDATION_KEY) {
        throw new UnauthorizedException('Invalid webhook signature');
      }
      const { eventType } = data;
      // Handle different webhook events
      switch (eventType) {
        case 'Settled':
          await this.coinflowService.handleSettled(data);
          break;
        // case 'Subscription Created':
        //   await this.coinflowService.handleSubscriptionCreated(data);
        //   break;
        default:
          return {
            success: true,
            message: `Successfully processed ${eventType} webhook`,
          };
      }

      return {
        success: true,
        message: `Successfully processed ${eventType} webhook`,
      };
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }

      throw new Error('Failed to process webhook');
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('feature-availability')
  @ApiOperation({
    summary: 'Get feature availability',
    description: 'Check if a feature is available for the user',
  })
  @ApiOkResponse({
    description: 'Feature availability fetched successfully'
  })
  @ApiBadRequestResponse({
    description: 'Feature availability not fetched due to invalid request data'
  })
  async featureAvailability(
    @Param('owner') owner: string
  ) {
    return await this.coinflowService.featureAvailability(owner);
  }

  //session token from coinflow
  @UseGuards(JwtAuthGuard)
  @Get('session-token')
  @ApiOkResponse()
  @ApiBadRequestResponse()
  async sessionKey(
    @Param('owner') owner: string,
  ) {
    return await this.coinflowService.sessionKey(owner);
  }
}