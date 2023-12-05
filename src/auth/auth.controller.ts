import { Body, Controller, Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup.user.dto';
import { user } from 'src/entities';
import { LocalAuthGuard } from './local/local.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignUpUserDto): Promise<user> {
    return this.authservice.signup(signupDto);
  }

  @UseGuards(LocalAuthGuard)
  @Post('signin')
  async login(@Request() req) {
    return req.user;
  }
}
 