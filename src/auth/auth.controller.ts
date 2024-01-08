import { Body, Controller, Get, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup.user.dto';
import { user_clients, user_restaurant } from 'src/entities';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { LocalUserAuthGuard } from './local/local-user.guard';
import { LocalManagerAuthGuard } from './local/local-manager.guard';

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

  @UseGuards(LocalUserAuthGuard)
  @HttpCode(200)
  @Post('signin/user')
  async login(@Request() req) {
    return this.authservice.loginUser(req.user)
  }

  @UseGuards(LocalManagerAuthGuard)
  @Post('signin/manager')
  async loginManager(@Request() req) {
    return this.authservice.loginManager(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
 