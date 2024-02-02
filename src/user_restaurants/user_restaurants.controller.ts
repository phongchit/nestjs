import { Body, Controller, Post, UseGuards, Request } from '@nestjs/common';
import { UserRestaurantsService } from './user_restaurants.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CreateRestaurantDto } from './dto/create.restaurant.dto';
import { restaurant, zone_table } from 'src/entities';
import { CreateZoneDto } from './dto/create.zone.dto';

@Controller('user-restaurants')
export class UserRestaurantsController {
  constructor(private userRestaurantsService: UserRestaurantsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-restaurant')
  async createRestaurant(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @Request() req,
  ): Promise<restaurant> {
    // return req.user
    return this.userRestaurantsService.createRestaurant(
      createRestaurantDto,
      req,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-zone')
  async createZone(
    @Body() createZoneDto: CreateZoneDto,
    @Request() req,
  ): Promise<zone_table> {
    // return req.user
    return this.userRestaurantsService.createZone(
      createZoneDto,
      req,
    );
  }
}
