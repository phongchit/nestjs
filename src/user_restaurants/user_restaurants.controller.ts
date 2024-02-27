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
  UploadedFile,
  UseInterceptors,
  UploadedFiles,
  ParseFilePipe,
  FileTypeValidator,
  Res,
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
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UpdateZoneDto } from './dto/update.zone.dto';
import { extname } from 'path';

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
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('upload/photo')
  @UseInterceptors(
    FilesInterceptor('photos', 3, {
      storage: diskStorage({
        destination: './restaurants',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const extension = extname(file.originalname);
          const filename = `${uniqueSuffix}${extension}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async uploadRestaurantPhoto(
    @UploadedFiles(
      new ParseFilePipe({
        validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    photos: Array<Express.Multer.File>,
    @Request() req,
  ): Promise<restaurant> {
    return this.userRestaurantsService.uploadPhotos(req.user, photos);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getRestaurant(@Request() req: any): Promise<restaurant> {
    return this.userRestaurantsService.getRestaurant(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/restaurant')
  async updateRestaurant(
    @Body() updateRestaurantDto: UpdateRestaurantDto,
    @Request() req,
  ): Promise<restaurant> {
    return this.userRestaurantsService.updateRestaurant(
      updateRestaurantDto,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create/zone')
  async createZone(
    @Body() createZoneDto: CreateZoneDto,
    @Request() req,
  ): Promise<zone_table> {
    return this.userRestaurantsService.createZone(createZoneDto, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones')
  async getZones(@Request() req: any) {
    return this.userRestaurantsService.getZones(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:zoneId/zone')
  async updateProfile(
    @Body() updatezonedto: UpdateZoneDto,
    @Param('zoneId') zoneId: string,
    @Request() req: any,
  ): Promise<zone_table> {
    return this.userRestaurantsService.updateZone(
      updatezonedto,
      req.user,
      zoneId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('create/:zoneId/table')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './tables',
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
  async createTable(
    @Body() createTableDto: CreateTableDto,
    @Request() req,
    @Param('zoneId') zoneId: string,
    @UploadedFile() photo: Express.Multer.File,
  ): Promise<table> {
    return this.userRestaurantsService.createTable(
      createTableDto,
      req,
      zoneId,
      photo,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones/:zoneId/tables')
  async getTablesByrZone(@Request() req: any): Promise<table[]> {
    return this.userRestaurantsService.getTables(req);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('add/admin')
  async addAdmin(
    @Body('username') username: string,
    @Request() req,
  ): Promise<user_restaurant> {
    return this.userRestaurantsService.addAdmin(username, req);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('delete/admin')
  async deleteAdmin(
    @Body('username') username: string,
    @Request() req,
  ): Promise<user_restaurant> {
    return this.userRestaurantsService.deleteAdmin(username, req);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations')
  async getReservations(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<reservation[]> {
    return this.userRestaurantsService.getReservations(req, date);
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
  @Get('tables/:tableId/reservations')
  async getReservationsByTableId(
    @Param('tableId') tableId: string,
  ): Promise<reservation[]> {
    return this.userRestaurantsService.getReservationsByTableId(tableId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('restaurant/photo')
  async getProfilePhoto(@Request() req: any, @Res() res: any): Promise<void> {
    const photos = await this.userRestaurantsService.getPhoto(req.user);

    const photoFileName = photos[0].photo_name;
    console.log(photoFileName);
    res.sendFile(path.join(__dirname, '../../restaurants/' + photoFileName));
  }
}
