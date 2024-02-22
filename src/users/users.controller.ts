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
import {  profile, reservation, restaurant } from 'src/entities';
import { CreateReservationDto } from './dto/craate.reservation.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { createProfileDto } from './dto/create.profile.dto';

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
  @Post('profile')
  async createProfile(
      @Body() createprofiledto:createProfileDto ,
      @Request() { user }: any,
  ): Promise<profile> {
      return this.userservice.createProfile(createprofiledto, user)
  }


  // @Post('uploads')
  // @UseInterceptors(FileInterceptor('photo', {
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

  // @UseGuards(JwtAuthGuard)
  // @Post('upload/photo')
  // @UseInterceptors(FileInterceptor('photo', {
  //   storage: diskStorage({
  //     destination: "./uploads", // Adjust the destination path as needed
  //     filename(req, file, callback) {
  //       const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
  //       const extension = extname(file.originalname);
  //       const filename = `${uniqueSuffix}${extension}`;
  //       callback(null, filename);
  //     },
  //   }),
  // }))
  // async uploadPhoto(@UploadedFile() file, @Request() req: any): Promise<{ photoPath: string }> {
  //   const createPhotoDto: CreatePhotoDto = { photo: file };
  //   const photoPath = await this.userservice.uploadPhoto(createPhotoDto, req.user);
  //   return { photoPath };
  // }

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('photo', {
    storage: diskStorage({
      destination: "./uploads", // Adjust the destination path as needed
      filename(req, file, callback) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = extname(file.originalname);
        const filename = `${uniqueSuffix}${extension}`;
        callback(null, filename);
      },
    }),
  }))
  async createProfileWithPhoto(
    @Body() createProfileDto: createProfileDto,
    @UploadedFile() photo,
    @Request() { user }: any,
  ): Promise<profile> {
    // Assuming you have a method in your userService to create a profile with a photo
    return this.userservice.createProfileWithPhoto(createProfileDto, photo, user);
  }
}
