import { Module } from '@nestjs/common';
import { UserRestaurantsService } from './user_restaurants.service';
import { UserRestaurantsController } from './user_restaurants.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { restaurant, user_restaurant } from 'src/entities';

@Module({
  imports: [TypeOrmModule.forFeature([user_restaurant,restaurant])],
  exports: [UserRestaurantsService],
  providers: [UserRestaurantsService],
  controllers: [UserRestaurantsController],
})
export class UserRestaurantsModule {}
