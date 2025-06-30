import { Body, Controller, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FeatureValidationGuard } from '../guards/feature-validation.guard';
import { Features } from '../decorators/features.decorator';
import { GamificationEventService } from './gamificationEvent.service';

@Controller('gamification-event')
export class GamificationEventController {
    constructor(private readonly gamificationEventService: GamificationEventService) { }

}
