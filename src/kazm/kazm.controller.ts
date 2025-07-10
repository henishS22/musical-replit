import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { KazmService } from './kazm.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateMemberDto, TrackEventDto } from './dto/kazm.dto';

@Controller('kazm')
export class KazmController {
  constructor(private readonly kazmService: KazmService) {}

  @Post('/member')
  @ApiOperation({
    description: 'Create member on Kazm',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async createMember(@Body() body: CreateMemberDto) {
    return await this.kazmService.createMember(body);
  }

  @Get('/member/:id')
  @ApiOperation({
    description: 'Search member',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async searchMember(@Param('id') id: string) {
    return await this.kazmService.searchMember(id);
  }

  @Post('/track/event')
  @ApiOperation({
    description: 'Track event on kazm',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async trackEvent(@Body() body: TrackEventDto) {
    return await this.kazmService.trackEvent(body);
  }
}
