import { Body, Controller, Post, UseGuards,Request, Patch, Param, Delete, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { createProfileDto } from './dto/create.profile.dto';
import { profile, user_clients } from 'src/entities';
import { updateProfileDto } from './dto/update.profile.dto';
import { CreateReservationDto } from './dto/craate.reservation.dto';
import { reservation } from 'src/entities/reservation.entity';

@Controller('users')
export class UsersController {
    constructor(private userservice: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Post('profile')
    async createProfile(
        @Body() createprofiledto:createProfileDto ,
        @Request() req: any,
    ): Promise<profile> {
        return this.userservice.createProfile(createprofiledto, req)
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(
        @Request() req: any,
    ): Promise<profile> {
        return this.userservice.getProfile(req)
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile/:id')
    async updateProfile(
      @Param('id') id: string,
      @Body() updateprofileDto: updateProfileDto,
      @Request() { user }: any,
    ): Promise<profile> {
      return this.userservice.updateProfile(id, updateprofileDto, user);
    }

    @UseGuards(JwtAuthGuard)
    @Delete('profile/:id')
    async deleteProfile(
      @Param('id') id: string,
      @Request() { user }: any,
    ): Promise<profile> {
      return this.userservice.deleteProfile(id, user);
    }

    @UseGuards(JwtAuthGuard)
    @Post('create-reservation')
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
      @Request() req: any, // Assuming you have configured Passport or similar for authentication
    ): Promise<reservation> {
      return this.userservice.cancelReservation(reservationId, req.user);
    }
}
