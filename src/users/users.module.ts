import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { profile, restaurant, table, user_clients, zone_table } from 'src/entities';
import { UsersController } from './users.controller';
import { reservation } from 'src/entities/reservation.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([user_clients, profile, table, reservation,restaurant, zone_table]),
  ],
  providers: [UsersService],
  exports: [UsersService],
  controllers: [UsersController],
})
export class UsersModule {}
