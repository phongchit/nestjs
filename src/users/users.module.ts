import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  profile,
  reservation,
  restaurant,
  table,
  user_clients,
  zone_table,
} from '../entities';
import { UsersController } from './users.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      user_clients,
      profile,
      table,
      reservation,
      restaurant,
      zone_table,
    ]),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
