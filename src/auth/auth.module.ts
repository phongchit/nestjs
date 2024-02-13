import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user_clients, user_restaurant } from 'src/entities';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt/jwt.strategy';
import { LocalUserStrategy } from './local/local-user.strategy';
import { UserRestaurantsModule } from 'src/user_restaurants/user_restaurants.module';
import { LocalRestaurantAuthGuard } from './local/local-restaurant.guard';
import { LocalrestaurantStrategy } from './local/local-restaurant.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([user_clients, user_restaurant]),
    UsersModule,
    UserRestaurantsModule,
    PassportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalUserStrategy,
    LocalrestaurantStrategy,
    LocalRestaurantAuthGuard,
    JwtStrategy,
  ],
})
export class AuthModule {}
