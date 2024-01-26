import { Body, Controller, Post, UseGuards,Request, Patch, Param, Delete, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/auth/jwt/jwt.guard';
import { createProfileDto } from './dto/create.profile.dto';
import { profile } from 'src/entities';
import { updateProfileDto } from './dto/update.profile.dto';

@Controller('users')
export class UsersController {
    constructor(private userservice: UsersService) {}

    @UseGuards(JwtAuthGuard)
    @Post('profile')
    async createProfile(
        @Body() createprofiledto:createProfileDto ,
        @Request() { user }: any,
    ): Promise<profile> {
        return this.userservice.createProfile(createprofiledto, user)
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(
        @Request() { user }: any,
    ): Promise<profile> {
        return this.userservice.getProfile(user)
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
}
