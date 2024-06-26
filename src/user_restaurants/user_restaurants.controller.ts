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
  UseInterceptors,
  ParseFilePipe,
  Res,
  UploadedFile,
  NotFoundException,
  Delete,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import { UpdateZoneDto } from './dto/update.zone.dto';
import { extname } from 'path';
import { UpdateTableDto } from './dto/update.table.dto';

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
  @Get('admin')
  async getAdmin(@Request() req): Promise<user_restaurant> {
    return this.userRestaurantsService.getprofile(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('photo')
  async getRestaurantPhoto(
    @Request() req: any,
    @Res() res: any,
  ): Promise<void> {
    try {
      const photoFileName =
        await this.userRestaurantsService.getRestaurantPhoto(req.user);
      if (photoFileName) {
        res.sendFile(path.join(__dirname, '../../restaurants/', photoFileName));
      } else {
        res.sendFile(path.join(__dirname, '../../restaurants/pub.png'));
      }
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile/photo')
  async getProfilePhoto(@Request() req: any, @Res() res: any): Promise<void> {
    try {
      const photoFileName = await this.userRestaurantsService.getProfilePhoto(
        req.user,
      );
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
  @Patch('photo')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './restaurants',
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
  async updateRestaurantPhoto(
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        // validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    photo: Express.Multer.File,
  ): Promise<restaurant> {
    return this.userRestaurantsService.updateRestaurantphoto(req.user, photo);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('profile/photo')
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
  async updateProfilephoto(
    @Request() req: any,
    @UploadedFile(
      new ParseFilePipe({
        // validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    photo: Express.Multer.File,
  ): Promise<user_restaurant> {
    return this.userRestaurantsService.updateprofilephoto(req.user, photo);
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
  @Delete('delete/restaurant')
  async DeleteRestaurant(@Request() req): Promise<void> {
    return this.userRestaurantsService.deleteRestaurant(req.user);
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
  async updateZone(
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
  @Delete('delete/:zoneId/zone')
  async deleteZone(
    @Body() updatezonedto: UpdateZoneDto,
    @Param('zoneId') zoneId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.userRestaurantsService.deleteZone(zoneId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('create/:zoneId/table')
  async createTable(
    @Body() createTableDto: CreateTableDto,
    @Request() req,
    @Param('zoneId') zoneId: string,
  ): Promise<table> {
    return this.userRestaurantsService.createTable(
      createTableDto,
      req.user,
      zoneId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update/:tableId/table')
  async updateTable(
    @Body() updateTableDto: UpdateTableDto,
    @Request() req,
    @Param('tableId') tableId: string,
  ): Promise<table> {
    return this.userRestaurantsService.updateTable(
      updateTableDto,
      req.user,
      tableId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':tableId/table')
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
  async updatePhoto(
    @Request() req: any,
    @Param('tableId') tableId: string,
    @UploadedFile(
      new ParseFilePipe({
        // validators: [new FileTypeValidator({ fileType: '.(png|jpeg|jpg)' })],
      }),
    )
    photo: Express.Multer.File,
  ): Promise<table> {
    return this.userRestaurantsService.uploadTablephoto(
      req.user,
      photo,
      tableId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':tableId/photo')
  async getTablePhoto(
    @Request() req: any,
    @Param('tableId') tableId: string,
    @Res() res: any,
  ): Promise<void> {
    try {
      const photoFileName = await this.userRestaurantsService.getTablePhoto(
        req.user.id,
        tableId,
      );
      res.sendFile(path.join(__dirname, '../../tables/' + photoFileName));
    } catch (error) {
      throw new NotFoundException();
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones/:zoneId/tables')
  async getTablesByZone(
    @Request() req: any,
    @Param('zoneId') zoneId: string,
  ): Promise<table[]> {
    return this.userRestaurantsService.getTables(req.user, zoneId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('zones/tables/:tableId')
  async deleteTable(
    @Request() req: any,
    @Param('tableId') tableId: string,
  ): Promise<void> {
    return this.userRestaurantsService.deleteTable(tableId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('zones/tables/:tableId')
  async GettablebyId(
    @Request() req: any,
    @Param('tableId') tableId: string,
  ): Promise<table> {
    return this.userRestaurantsService.getTableByTableId(tableId, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('add/admin')
  async addAdmin(
    @Body('username') username: string,
    @Request() req,
  ): Promise<user_restaurant> {
    return this.userRestaurantsService.addAdmin(username, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('delete/admin')
  async deleteAdmin(
    @Body('username') username: string,
    @Request() req,
  ): Promise<user_restaurant> {
    return this.userRestaurantsService.deleteAdmin(username, req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservations')
  async getReservations(
    @Request() req: any,
    @Query('date') date?: string,
  ): Promise<reservation[]> {
    return this.userRestaurantsService.getReservations(req.user, date);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('cancel/reservation/:reservationId')
  async cancelReservation(
    @Param('reservationId') reservationId: string,
    @Request() req: any,
  ): Promise<void> {
    return this.userRestaurantsService.cancelReservation(
      reservationId,
      req.user,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get('reservation/:reservationId')
  async GetreservationbyId(
    @Request() req,
    @Param('reservationId') reservationId: string,
  ): Promise<reservation> {
    return this.userRestaurantsService.getReservationById(
      reservationId,
      req.user,
    );
  }
}
