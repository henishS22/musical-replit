import { Body, Controller, Get, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { DistroService } from './distro.service';
import {
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { DistroDto } from './dto/distro.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FeatureValidationGuard } from '../guards/feature-validation.guard';
import { Features } from '../decorators/features.decorator';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';

@Controller('distro')
@UseInterceptors(LoggingInterceptor)
export class DistroController {
  constructor(private readonly distroService: DistroService) { }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'streaming' }
  ])
  @Post('/create')
  @ApiOperation({
    description: 'Create Distro for user',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async create(
    @Param('owner') owner: string,
    @Body() body: DistroDto
  ) {
    return await this.distroService.create(body, owner);
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'streaming' }
  ])
  @Get('/get')
  @ApiOperation({
    description: 'Get Distro for user',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async get(
    @Param('owner') owner: string,
  ) {
    return await this.distroService.get(owner);
  }

  @UseGuards(JwtAuthGuard, FeatureValidationGuard)
  @Features([
    { featureKey: 'streaming' }
  ])
  @Put('/update')
  @ApiOperation({
    description: 'Update Distro for user',
  })
  @ApiOkResponse({
    description: 'Success',
  })
  @ApiBadRequestResponse({
    description: 'Bad request',
  })
  async update(
    @Param('owner') owner: string,
    @Body() body: DistroDto
  ) {
    return await this.distroService.update(body, owner);
  }

}
