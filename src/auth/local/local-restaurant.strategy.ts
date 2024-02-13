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
    const restaurant = await this.authService.validateRestaurant(
      username,
      password,
    );
    if (!restaurant) {
      throw new UnauthorizedException();
    }
    return restaurant;
  }
}
