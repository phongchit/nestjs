import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup.user.dto';
import { user_clients, user_restaurant } from 'src/entities';
import { JwtAuthGuard } from './jwt/jwt.guard';
import { LocalUserAuthGuard } from './local/local-user.guard';
import { LocalRestaurantAuthGuard } from './local/local-restaurant.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Post('signup/user')
  @HttpCode(200)
  async signupUser(@Body() signupDto: SignUpUserDto): Promise<user_clients> {
    return this.authservice.signupUser(signupDto);
  }

  @Post('signup/restaurant')
  @HttpCode(200)
  async signupRestaurant(
    @Body() signupDto: SignUpUserDto,
  ): Promise<user_restaurant> {
    return this.authservice.signupRestaurant(signupDto);
  }

  @UseGuards(LocalUserAuthGuard)
  @HttpCode(200)
  @Post('signin/user')
  async login(@Request() req) {
    return this.authservice.loginUser(req.user);
  }

  @UseGuards(LocalRestaurantAuthGuard)
  @Post('signin/restaurant')
  async loginRestaurant(@Request() req) {
    return this.authservice.loginRestaurant(req.user);
  }
}
