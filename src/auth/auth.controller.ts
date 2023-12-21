import { Body, Controller, HttpCode, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup.user.dto';
import { user_clients } from 'src/entities';
import { LocalAuthGuard } from './local/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Post('signup')
  @HttpCode(200)
  signup(@Body() signupDto: SignUpUserDto): Promise<user_clients> {
    return this.authservice.signup(signupDto);
  }

  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('signin')
  async login(@Request() req) {
    return this.authservice.login(req.user)
  }
}
 