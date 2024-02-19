import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalrestaurantStrategy extends PassportStrategy(
  Strategy,
  'local-restaurant',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(username: string, password: string): Promise<any> {
    const Username = username.toLowerCase();
    const restaurant = await this.authService.validateRestaurant(
      Username,
      password,
    );
    if (!restaurant) {
      throw new UnauthorizedException();
    }
    return restaurant;
  }
}
