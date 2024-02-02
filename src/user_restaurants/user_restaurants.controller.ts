import { Body, Controller, Post, UseGuards, Request, Param, Get } from '@nestjs/common';
import { UserRestaurantsService } from './user_restaurants.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CreateRestaurantDto } from './dto/create.restaurant.dto';
import { restaurant, table, zone_table } from 'src/entities';
import { CreateZoneDto } from './dto/create.zone.dto';
import { CreateTableDto } from './dto/create.table.dto';

@Controller('restaurants')
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

  @UseGuards(JwtAuthGuard)
  @Post('zones/:zoneId/create-table')
  async createTable(
    @Param('zoneId') zoneId: string,
    @Body() createTableDto: CreateTableDto,
    @Request() req: any,
  ) {
    return this.userRestaurantsService.createTable(zoneId, createTableDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones')
  async getZonesForAdmin(@Request() req: any) {
    return this.userRestaurantsService.getZonesForAdmin(req.user.id);
  }
}
