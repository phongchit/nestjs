import {
  Body,
  Controller,
  Post,
  UseGuards,
  Request,
  Patch,
  Param,
  Get,
  Delete,
  Query,
  UploadedFile,
  UseInterceptors,
  Res,
  ParseFilePipe,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from './users.service';
// import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { JwtAuthGuard } from '../auth/jwt/jwt.guard';

// import { profile, reservation, restaurant, table } from 'src/entities';
import { profile, reservation, restaurant, table } from '../entities';
import { CreateReservationDto } from './dto/craate.reservation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { createProfileDto } from './dto/create.profile.dto';
import { extname } from 'path';
import { updateProfileDto } from './dto/update.profile.dto';
@Controller('users')
export class UsersController {
  constructor(private userservice: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create/:tableId/reservation')
  async createReservation(
    @Body() createReservationDto: CreateReservationDto,
    @Param('tableId') tableId: string,
    @Request() req: any,
  ): Promise<reservation> {
    return this.userservice.createReservation(
      createReservationDto,
      tableId,
      req.user,
    );
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
  @Get('reservations/:reservationId')
  async Reservation(
    @Param('reservationId') reservationId: string,
    @Request() req: any,
  ): Promise<reservation> {
    return this.userservice.getReservaionbyId(reservationId, req.user);
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
  @Get(':zoneId/tables')
  async getTablesByZoneId(
    @Param('zoneId') zoneId: string,
    @Request() req: any,
  ): Promise<table[]> {
    return this.userservice.getTableByZoneId(zoneId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations')
  async getUserReservations(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<reservation[]> {
    return this.userservice.getReservations(req.user, date);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './profile',
        filename(req, file, callback) {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          const filename = `${uniqueSuffix}${extension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async updatePhoto(
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        // validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    photo: Express.Multer.File,
  ): Promise<profile> {
    return this.userservice.updateProfilephoto(req.user, photo);
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  async createProfile(
    @Body() createProfileDto: createProfileDto,
    @Request() req: any,
  ): Promise<profile> {
    return this.userservice.createProfile(createProfileDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any): Promise<profile> {
    return this.userservice.getProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Body() updateProfileDto: updateProfileDto,
    @Request() req: any,
  ): Promise<profile> {
    return this.userservice.updateProfile(updateProfileDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/photo')
  async getProfilePhoto(@Request() req: any, @Res() res: any): Promise<void> {
    try {
      const photoFileName = await this.userservice.getProfilePhoto(req.user);
      if (photoFileName) {
        res.sendFile(path.join(__dirname, '../../profile/', photoFileName));
      } else {
        res.sendFile(
          path.join(__dirname, '../../profile/silhouette-person-icon.png'),
        );
      }
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteProfile(@Request() req: any) {
    return this.userservice.deleteProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('photo')
  async deletePhoto(@Request() req: any) {
    return this.userservice.deletePhoto(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('/get/:tableId')
  async getTablebyId(
    @Param('tableId') tableId: string,
    @Request() req: any,
  ): Promise<table> {
    return this.userservice.gettablebyId(tableId, req.user);
  }
}
