import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpUserDto } from './dto/signup.user.dto';
import { user } from 'src/entities';

@Controller('auth')
export class AuthController {
  constructor(private readonly authservice: AuthService) {}

  @Post('signup')
  signup(@Body() signupDto: SignUpUserDto): Promise<user> {
    return this.authservice.signup(signupDto);
  }
}
