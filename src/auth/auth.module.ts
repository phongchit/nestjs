import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { user } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([user])],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
