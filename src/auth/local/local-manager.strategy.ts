import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalManagerStrategy extends PassportStrategy(Strategy, 'local-manager') {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const manager = await this.authService.validateManager(username, password);
    if (!manager) {
      throw new UnauthorizedException();
    }
    return manager;
  }
}
