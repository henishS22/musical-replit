import { Body, Controller, Get, Param, Post, Headers, UnauthorizedException, UseGuards, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, } from '@nestjs/swagger';

// Services Imports
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ChartMetricService } from './chartmetric.service';

@Controller('chartmetric')
@ApiTags('chartmetric')
export class ChartmetricController {
    constructor(private readonly chartmetricService: ChartMetricService) { }

    @UseGuards(JwtAuthGuard,)
    @Get('/get-chartmetric-data')
    @ApiOperation({
        description: 'Get Chartmetric data.'
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async getChartmeticData(
        @Param('owner') owner: string,
    ) {
        return await this.chartmetricService.getChartmeticData(owner);
    }

    @UseGuards(JwtAuthGuard,)
    @Get('/get-releases')
    @ApiOperation({
        description: 'Get Releases data.'
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async getReleases(
        @Param('owner') owner: string,
    ) {
        return await this.chartmetricService.getReleases(owner);
    }

    @UseGuards(JwtAuthGuard,)
    @Get('/get-audience')
    @ApiOperation({
        description: 'Get Releases data.'
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async getAudience(
        @Param('owner') owner: string,
    ) {
        return await this.chartmetricService.getAudience(owner);
    }

    @UseGuards(JwtAuthGuard,)
    @Get('/chatbot/chartmetric-data')
    @ApiOperation({
        description: 'Get Chartmetric data for chatbot(AI use).'
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async chartmeticData(
        @Param('owner') owner: string,
    ) {
        return await this.chartmetricService.chartmeticData(owner);
    }

}