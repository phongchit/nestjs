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
  NotFoundException,
  Res,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { profile, reservation, restaurant } from 'src/entities';
import { CreateReservationDto } from './dto/craate.reservation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { createProfileDto } from './dto/create.profile.dto';
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

  @UseGuards(JwtAuthGuard)
  @Post('upload')
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
  async createProfile(
    @Body() createProfileDto: createProfileDto,
    @Request() req: any,
    @UploadedFile() photo: Express.Multer.File,
  ): Promise<profile> {
    return this.userservice.createProfile(createProfileDto, photo, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any): Promise<profile> {
    return this.userservice.getProfile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile')
  async updateProfile(
    @Body() updateProfileDto: createProfileDto,
    @Request() req: any,
  ): Promise<profile> {
    return this.userservice.updateProfile(updateProfileDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/photo')
  async getProfilePhoto(@Request() req: any, @Res() res: any): Promise<void> {
    try {
      const profile = await this.userservice.getProfile(req.user);

      if (!profile.photo) {
        throw new NotFoundException();
      }
      res.sendFile(path.join(__dirname, '../../profile/' + profile.photo));
    } catch (error) {
      res.status(404).json({ message: 'Photo not found' });
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete('profile')
  async deleteProfile(@Request() req: any) {
    return this.userservice.deleteProfile(req.user);
  }
}
