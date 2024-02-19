import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Param,
  Get,
  Patch,
  Query,
} from '@nestjs/common';
import { UserRestaurantsService } from './user_restaurants.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { CreateRestaurantDto } from './dto/create.restaurant.dto';
import {
  reservation,
  restaurant,
  table,
  user_restaurant,
  zone_table,
} from 'src/entities';
import { CreateZoneDto } from './dto/create.zone.dto';
import { CreateTableDto } from './dto/create.table.dto';
import { UpdateRestaurantDto } from './dto/update.restaurant.dto';

@Controller('restaurants')
export class UserRestaurantsController {
  constructor(private userRestaurantsService: UserRestaurantsService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/restaurant')
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
  @Patch('update/restaurant')
  async updateRestaurant(
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @Request() req,
  ): Promise<restaurant> {
    return this.userRestaurantsService.updateRestaurant(
      updateRestaurantDto,
      req,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create/zone')
  async createZone(
    @Body() createZoneDto: CreateZoneDto,
    @Request() req,
  ): Promise<zone_table> {
    return this.userRestaurantsService.createZone(createZoneDto, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones')
  async getZones(@Request() req: any) {
    return this.userRestaurantsService.getZones(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create/:zoneId/table')
  async createTable(
    @Body() createTableDto: CreateTableDto,
    @Request() req,
    @Param('zoneId') zoneId: string,
  ): Promise<table> {
    return this.userRestaurantsService.createTable(createTableDto, req, zoneId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones/:zoneId/tables')
  async getTablesByrZone(@Request() req: any): Promise<table[]> {
    return this.userRestaurantsService.getTables(req);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('add-admin')
  async addAdmin(
    @Body('username') username: string,
    @Request() req,
  ): Promise<user_restaurant> {
    return this.userRestaurantsService.addAdmin(username, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations')
  async getReservations(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<reservation[]> {
    return this.userRestaurantsService.getReservations(req,date);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cancel/reservation/:reservationId')
  async cancelReservation(
    @Param('reservationId') reservationId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.userRestaurantsService.cancelReservation(reservationId, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('tables/:tableId/reservations') // Define your route
  async getReservationsByTableId(
    @Param('tableId') tableId: string,
  ): Promise<reservation[]> {
    return this.userRestaurantsService.getReservationsByTableId(tableId);
  }
}
