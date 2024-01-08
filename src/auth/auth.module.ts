import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user_clients, user_restaurant } from 'src/entities';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { LocalStrategy } from './local/local.strategy';
import { JwtModule } from '@nestjs/jwt';
import { jwtConstants } from './constants';
import { JwtStrategy } from './jwt/jwt.strategy';
import { ManagersModule } from 'src/managers/managers.module';

@Module({
  imports: [TypeOrmModule.forFeature([user_clients,user_restaurant]),UsersModule,ManagersModule,PassportModule,JwtModule.register({
    secret: jwtConstants.secret,
    signOptions:{expiresIn:'7d'}
  })],
  controllers: [AuthController],
  providers: [AuthService,LocalStrategy,JwtStrategy],
})
export class AuthModule {}
