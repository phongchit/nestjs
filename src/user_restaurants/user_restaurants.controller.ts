import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Get,
  Patch,
} from '@nestjs/common';
import { UserRestaurantsService } from './user_restaurants.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CreateRestaurantDto } from './dto/create.restaurant.dto';
import { restaurant, table, user_restaurant, zone_table } from 'src/entities';
import { CreateZoneDto } from './dto/create.zone.dto';
import { CreateTableDto } from './dto/create.table.dto';
import { UpdateRestaurantDto } from './dto/update.restaurant.dto';

@Controller('restaurants')
export class UserRestaurantsController {
  constructor(private userRestaurantsService: UserRestaurantsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create-restaurant')
  async createRestaurant(
    @Body() createRestaurantDto: CreateRestaurantDto,
    @Request() req,
  ): Promise<restaurant> {
    return this.userRestaurantsService.createRestaurant(
      createRestaurantDto,
      req,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRestaurant(@Request() req: any): Promise<restaurant> {
    return this.userRestaurantsService.getRestaurant(req);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update-restaurant')
  async updateRestaurant(
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @Request() req,
  ): Promise<restaurant> {
    return this.userRestaurantsService.updateRestaurant(updateRestaurantDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create-zone')
  async createZone(
    @Body() createZoneDto: CreateZoneDto,
    @Request() req,
  ): Promise<zone_table> {
    return this.userRestaurantsService.createZone(createZoneDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones')
  async getZonesForAdmin(@Request() req: any) {
    return this.userRestaurantsService.getZones(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':zoneId/create-table')
  async createTable(
    @Body() createTableDto: CreateTableDto,
    @Request() req,
    @Param('zoneId') zoneId: string,
  ): Promise<table> {
    return this.userRestaurantsService.createTable(createTableDto, req, zoneId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones/:zoneId/tables')
  async getTablesForZone(@Request() req: any): Promise<table[]> {
    return this.userRestaurantsService.getTables(req);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('add-admin')
  async addAdminToRestaurant(
    @Body('username') username: string,
    @Request() req,
  ): Promise<user_restaurant> {
    return this.userRestaurantsService.addAdminToRestaurant(username, req);
  }

}
