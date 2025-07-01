import { Body, Controller, Get, Param, Post, Put, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import {
    ApiBadRequestResponse,
    ApiOkResponse,
    ApiOperation,
} from '@nestjs/swagger';
import { EmailDTO, InstaConnectDTO, PostDTO, ProfileConnectDTO, TextDTO } from './dto/scrapper.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { ScrapperService } from './scrapper.service';
import { LoggingInterceptor } from '../interceptors/loggin.interceptor';

@Controller('scrapper')
@UseInterceptors(LoggingInterceptor)
export class ScrapperController {
    constructor(private readonly scrapperService: ScrapperService) { }

    //Instagram profile check
    @UseGuards(JwtAuthGuard)
    @Post('/instagram')
    @ApiOperation({
        description: 'Get Instagram Profile',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async instagram(
        @Param('owner') owner: string,
        @Body() connect: InstaConnectDTO,
    ) {
        return await this.scrapperService.checkInstagramProfileExists(connect, owner);
    }


    //Facebook profile check
    @UseGuards(JwtAuthGuard)
    @Post('/facebook')
    @ApiOperation({
        description: 'Get Facebook Profile',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async facebook(
        @Param('owner') owner: string,
        @Body() connect: ProfileConnectDTO,
    ) {
        return await this.scrapperService.checkFacebookProfileExists(connect, owner);
    }

    //X profile check
    @UseGuards(JwtAuthGuard)
    @Post('/x')
    @ApiOperation({
        description: 'Get X Profile',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async x(
        @Param('owner') owner: string,
        @Body() connect: ProfileConnectDTO,
    ) {
        return await this.scrapperService.checkXProfileExists(connect, owner);
    }

    //Tiktok profile check
    @Post('/tiktok')
    @ApiOperation({
        description: 'Get Tiktok Profile',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async tiktok(
        @Param('owner') owner: string,
        @Body() connect: ProfileConnectDTO,
    ) {
        return await this.scrapperService.checkTiktokProfileExists(connect, owner);
    }


    //Sign up for email
    @UseGuards(JwtAuthGuard)
    @Post('/signup-email')
    @ApiOperation({
        description: 'Get user email',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async signupEmail(
        @Param('owner') owner: string,
        @Body() dto: EmailDTO,
    ) {
        return await this.scrapperService.checkEmail(dto, owner);
    }


    //Sign up for text
    @UseGuards(JwtAuthGuard)
    @Post('/signup-text')
    @ApiOperation({
        description: 'Get user mobile number',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async signupText(
        @Param('owner') owner: string,
        @Body() dto: TextDTO,
    ) {
        return await this.scrapperService.checkText(dto, owner);
    }


    //Instagram Post check
    @UseGuards(JwtAuthGuard)
    @Post('/instagram-post')
    @ApiOperation({
        description: 'Get Instagram Post',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async instagramPost(
        @Param('owner') owner: string,
        @Body() dto: PostDTO,
    ) {
        return await this.scrapperService.instagramPostAnalysis(dto, owner);
    }


    //Facebook Post check
    @UseGuards(JwtAuthGuard)
    @Post('/facebook-post')
    @ApiOperation({
        description: 'Get Instagram Post',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async facebookPost(
        @Param('owner') owner: string,
        @Body() dto: PostDTO,
    ) {
        return await this.scrapperService.facebookPostAnalysis(dto, owner);
    }

    //X Post check
    @UseGuards(JwtAuthGuard)
    @Post('/x-post')
    @ApiOperation({
        description: 'Get X Post',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async xPost(
        @Param('owner') owner: string,
        @Body() dto: PostDTO,
    ) {
        return await this.scrapperService.xPostAnalysis(dto, owner);
    }

    //Tiktok Post check
    @UseGuards(JwtAuthGuard)
    @Post('/tiktok-post')
    @ApiOperation({
        description: 'Get Tiktok Post',
    })
    @ApiOkResponse({
        description: 'Success',
    })
    @ApiBadRequestResponse({
        description: 'Bad request',
    })
    async tiktokPost(
        @Param('owner') owner: string,
        @Body() dto: PostDTO,
    ) {
        return await this.scrapperService.tiktokPostAnalysis(dto, owner);
    }
}
