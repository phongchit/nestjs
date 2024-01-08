import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup.user.dto';
import { user_clients, user_restaurant } from 'src/entities';
import { LocalAuthGuard } from './local/local.guard';
import { JwtAuthGuard } from './jwt/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Post('signup/user')
  @HttpCode(200)
  signupUser(@Body() signupDto: SignUpUserDto): Promise<user_clients> {
    return this.authservice.signupUser(signupDto);
  }

  @Post('signup/manager')
  @HttpCode(200)
  signupManger(@Body() signupDto: SignUpUserDto): Promise<user_restaurant> {
    return this.authservice.signupManager(signupDto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('signin/user')
  async login(@Request() req) {
    return this.authservice.loginUser(req.user)
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
 