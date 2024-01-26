import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { profile, user_clients } from 'src/entities';
import { UsersController } from './users.controller';

@Module({
  imports: [TypeOrmModule.forFeature([user_clients,profile])],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
