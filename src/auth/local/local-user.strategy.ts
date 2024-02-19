// auth/local/local-user.strategy.ts

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalUserStrategy extends PassportStrategy(
  Strategy,
  'local-user',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const Username = username.toLowerCase();

    const user = await this.authService.validateUser(Username, password);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
