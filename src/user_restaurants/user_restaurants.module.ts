import { Module } from '@nestjs/common';
import { UserRestaurantsService } from './user_restaurants.service';
import { UserRestaurantsController } from './user_restaurants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  reservation,
  restaurant,
  table,
  user_restaurant,
  zone_table,
} from 'src/entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      user_restaurant,
      restaurant,
      zone_table,
      table,
      reservation,
    ]),
  ],
  exports: [UserRestaurantsService],
  providers: [UserRestaurantsService],
  controllers: [UserRestaurantsController],
})
export class UserRestaurantsModule {}
