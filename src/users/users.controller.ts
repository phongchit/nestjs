import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Patch,
  Param,
  Get,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import {  restaurant } from 'src/entities';
import { CreateReservationDto } from './dto/craate.reservation.dto';
import { reservation } from 'src/entities/reservation.entity';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('users')
export class UsersController {
  constructor(private userservice: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/reservation')
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: any,
  ): Promise<reservation> {
    return this.userservice.createReservation(createReservationDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':reservationId/cancel')
  async cancelReservation(
    @Param('reservationId') reservationId: string,
    @Request() req: any,
  ): Promise<reservation> {
    return this.userservice.cancelReservation(reservationId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('restaurant')
  async getRestaurant(): Promise<restaurant[]> {
    return this.userservice.getAllRestaurants();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':restaurantId/zones')
  async getZone(@Param('restaurantId') restaurantId: string): Promise<any> {
    return this.userservice.getZoneByRestaurantId(restaurantId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations')
  async getUserReservations(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<reservation[]> {
    return this.userservice.getReservations(req.user, date);
  }

  // @Post('upload')
  // @UseInterceptors(FileInterceptor('file', {
  //   storage: diskStorage({
  //     destination: "./uploads", // Adjust the destination path as needed
  //     filename(req,file, callback) {
  //       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  //       const extension = extname(file.originalname);
  //       const filename = `${uniqueSuffix}${extension}`;
  //       callback(null, filename);
  //     },
  //   }),
  // }))
  // async upload(@UploadedFile() file) {
  //   return { message: 'File uploaded successfully', filename: file.filename };
  // }
}
