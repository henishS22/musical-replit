import { Controller, Get, Req, Res, UseGuards, Query, Body, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) { }

  // Get google authentication URL
  @Get('/get-google-code')
  async googleCode(@Query() options: any) {
    return await this.authService.googleAuthURL(options);
  }

  // Get google data by exchanging access token
  @Post('/get-google-data')
  async googleCallback(@Body() params: any) {
    return await this.authService.googleCallback(params);
  }
}
