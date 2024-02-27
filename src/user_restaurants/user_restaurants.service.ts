import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  restaurant,
  restaurantPhotos,
  table,
  user_restaurant,
  zone_table,
} from 'src/entities';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create.restaurant.dto';
import { CreateZoneDto } from './dto/create.zone.dto';
import { CreateTableDto } from './dto/create.table.dto';
import { UpdateRestaurantDto } from './dto/update.restaurant.dto';
import { reservation } from 'src/entities/reservation.entity';
import { UpdateZoneDto } from './dto/update.zone.dto';

@Injectable()
export class UserRestaurantsService {
  constructor(
    @InjectRepository(user_restaurant)
    private adminRepository: Repository<user_restaurant>,
    @InjectRepository(restaurant)
    private restaurantRepository: Repository<restaurant>,
    @InjectRepository(zone_table)
    private zoneRepository: Repository<zone_table>,
    @InjectRepository(table)
    private tableRepository: Repository<table>,
    @InjectRepository(reservation)
    private reservationRepository: Repository<reservation>,
    @InjectRepository(restaurantPhotos)
    private restaurantPhotosRepository: Repository<restaurantPhotos>,
  ) {}

  async findOne(username: string): Promise<user_restaurant | undefined> {
    const user = await this.adminRepository.findOne({ where: { username } });
    return user;
  }

  private async findOnerestaurant(
    rest_name: string,
  ): Promise<restaurant | undefined> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { rest_name },
    });
    return restaurant;
  }

  private async checkUser(userId: string) {
    const user = await this.adminRepository.findOne({
      where: { id: userId },
      relations: ['adminRestaurant'],
    });

    if (!user || !user.adminRestaurant) {
      throw new UnauthorizedException(
        'User or associated restaurant not found.',
      );
    }

    return user;
  }

  async createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
    req: any,
  ): Promise<restaurant> {
    const { rest_name, rest_description, rest_phone_number } =
      createRestaurantDto;

    const user = await this.adminRepository.findOne({
      where: { id: req.user.id },
      relations: ['adminRestaurant'],
    });

    if (user.adminRestaurant) {
      throw new BadRequestException(
        'User is already associated with a restaurant.',
      );
    }

    const existingRestaurant = await this.findOnerestaurant(rest_name);

    if (existingRestaurant) {
      throw new ConflictException(
        'Restaurant with the same name already exists',
      );
    }

    const newRestaurant = this.restaurantRepository.create({
      rest_name,
      rest_description,
      rest_phone_number,
    });

    try {
      const createdRestaurant =
        await this.restaurantRepository.save(newRestaurant);
      user.adminRestaurant = createdRestaurant;
      await this.adminRepository.save(user);
      return createdRestaurant;
    } catch (error) {
      console.error('Error when creating restaurant:', error);
      throw new ConflictException('Error when creating restaurant');
    }
  }

  async uploadPhotos(
    req: any,
    photos: Array<Express.Multer.File>,
  ): Promise<any> {
    const processedPhotos: restaurantPhotos[] = [];
    const user = await this.adminRepository.findOne({
      where: { id: req.user.id },
      relations: ['adminRestaurant'],
    });
  
    if (!user.adminRestaurant) {
      throw new BadRequestException('User must have a restaurant.');
    }
  
    const restaurant = user.adminRestaurant;
  
    for (const photo of photos) {
      const newPhoto = this.restaurantPhotosRepository.create({
        photo_name: photo.filename,
        restaurant,
      });
  
      const savedPhoto = await this.restaurantPhotosRepository.save(newPhoto);
  
      processedPhotos.push(savedPhoto);
    }
  
    return processedPhotos;
  }  

  async getRestaurant(req: any): Promise<restaurant> {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }

      const user = await this.adminRepository.findOne({
        where: { id: req.user.id },
        relations: ['adminRestaurant', 'adminRestaurant.photos'],
      });

      if (!user || !user.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurant = user.adminRestaurant;

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found.');
      }

      return restaurant;
    } catch (error) {
      console.error('Error when getting restaurant:', error);
      throw new NotFoundException('Error when getting restaurant');
    }
  }

  async updateRestaurant(
    updateRestaurantDto: UpdateRestaurantDto,
    @Request() req: any,
  ): Promise<restaurant> {
    const { rest_name, rest_description, rest_phone_number } =
      updateRestaurantDto;

    if (!req.user || !req.user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const user = await this.adminRepository.findOne({
        where: { id: req.user.id },
        relations: ['adminRestaurant'],
      });

      if (!user || !user.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurant = user.adminRestaurant;

      if (!restaurant) {
        throw new NotFoundException('Restaurant not found.');
      }

      if (rest_name) {
        const existingRestaurant = await this.findOnerestaurant(rest_name);

        if (existingRestaurant) {
          throw new ConflictException(
            'Restaurant with the same name already exists',
          );
        }
      }

      if (rest_name) {
        restaurant.rest_name = rest_name;
      }

      if (rest_description) {
        restaurant.rest_description = rest_description;
      }

      if (rest_phone_number) {
        restaurant.rest_phone_number = rest_phone_number;
      }

      await this.restaurantRepository.save(restaurant);
      return restaurant;
    } catch (error) {
      console.error('Error when updating restaurant:', error);
      throw new ConflictException('Error when updating restaurant');
    }
  }

  async createZone(
    createZoneDto: CreateZoneDto,
    @Request() req,
  ): Promise<zone_table> {
    const { zone_name, zone_descripe } = createZoneDto;

    if (!req.user || !req.user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const user = await this.adminRepository.findOne({
        where: { id: req.user.id },
        relations: ['adminRestaurant'],
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const restaurant = user.adminRestaurant;

      if (!restaurant) {
        throw new NotFoundException('User has no associated restaurant.');
      }

      const newZone = this.zoneRepository.create({
        zone_name,
        zone_descripe,
        restaurant,
      });

      return await this.zoneRepository.save(newZone);
    } catch (error) {
      throw new ConflictException('Error when creating zone');
    }
  }

  async updateZone(
    updatezonedto: UpdateZoneDto,
    user: user_restaurant,
    zoneId: string,
  ): Promise<zone_table> {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }
    const { zone_name, zone_descripe } = updatezonedto;
    const existingZone = await this.zoneRepository.findOne({
      where: { id: zoneId },
    });

    if (!existingZone) {
      throw new NotFoundException('Profile not found.');
    }

    existingZone.zone_descripe = zone_descripe || existingZone.zone_descripe;
    existingZone.zone_name = zone_name || existingZone.zone_name;

    try {
      await this.zoneRepository.save(existingZone);
      return existingZone;
    } catch (e) {
      throw new ConflictException();
    }
  }

  async getZones(userId: string): Promise<zone_table[]> {
    try {
      const user = await this.adminRepository.findOne({
        where: { id: userId },
        relations: ['adminRestaurant'],
      });

      if (!user || !user.adminRestaurant) {
        throw new UnauthorizedException(
          'User or associated restaurant not found.',
        );
      }

      const restaurantId = user.adminRestaurant.id;
      const zones = await this.zoneRepository.find({
        where: { restaurant: { id: restaurantId } },
      });

      return zones;
    } catch (error) {
      console.error('Error when getting zones for admin:', error);
      throw new UnauthorizedException('Error when getting zones for admin');
    }
  }

  async createTable(
    createTableDto: CreateTableDto,
    @Request() req,
    zoneId: string,
    photo: any,
  ): Promise<table> {
    const { table_number, table_capacity, table_describe } = createTableDto;

    if (!req.user || !req.user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const user = await this.adminRepository.findOne({
        where: { id: req.user.id },
        relations: ['adminRestaurant'],
      });

      if (!user || !user.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurant = user.adminRestaurant;
      const zone = await this.zoneRepository.findOne({
        where: { id: zoneId, restaurant: { id: restaurant.id } },
      });

      if (!zone) {
        throw new NotFoundException('Zone not found.');
      }

      const newTable = this.tableRepository.create({
        table_number,
        table_capacity,
        table_describe,
        zone,
        photo: photo.filename,
      });

      return await this.tableRepository.save(newTable);
    } catch (error) {
      console.error('Error when creating table:', error);
      throw new ConflictException('Error when creating table');
    }
  }

  async getTables(req: any): Promise<table[]> {
    try {
      if (!req.user || !req.user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }

      const user = await this.adminRepository.findOne({
        where: { id: req.user.id },
        relations: ['adminRestaurant'],
      });

      if (!user || !user.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurant = user.adminRestaurant;

      const zoneId = req.params.zoneId;

      const zone = await this.zoneRepository.findOne({
        where: { id: zoneId, restaurant: { id: restaurant.id } },
        relations: ['tables'],
      });

      if (!zone) {
        throw new NotFoundException('Zone not found.');
      }

      return zone.tables || [];
    } catch (error) {
      console.error('Error when getting tables for zone:', error);
      if (
        error instanceof NotFoundException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new NotFoundException('Error when getting tables for zone');
    }
  }

  async addAdmin(username: string, req: any): Promise<user_restaurant> {
    try {
      const currentUserId = req.user.id;

      const currentUser = await this.adminRepository.findOne({
        where: { id: currentUserId },
        relations: ['adminRestaurant'],
      });

      if (!currentUser || !currentUser.adminRestaurant) {
        throw new UnauthorizedException(
          'User or associated restaurant not found.',
        );
      }

      const userToAdd = await this.adminRepository.findOne({
        where: { username },
        relations: ['adminRestaurant'],
      });

      if (!userToAdd) {
        throw new NotFoundException('User to be added not found.');
      }

      if (
        userToAdd.adminRestaurant &&
        userToAdd.adminRestaurant.id !== currentUser.adminRestaurant.id
      ) {
        throw new ConflictException(
          'User is already an admin for another restaurant.',
        );
      }

      userToAdd.adminRestaurant = currentUser.adminRestaurant;

      await this.adminRepository.save(userToAdd);

      return userToAdd;
    } catch (error) {
      console.error('Error when adding admin to restaurant:', error);
      throw new ConflictException('Error when adding admin to restaurant');
    }
  }

  async cancelReservation(reservationId: string, req: any): Promise<any> {
    try {
      const user = await this.adminRepository.findOne({
        where: { id: req.user.id },
        relations: ['adminRestaurant'],
      });

      if (!user || !user.adminRestaurant) {
        throw new UnauthorizedException(
          'User or associated restaurant not found.',
        );
      }

      const reservation = await this.reservationRepository.findOne({
        where: {
          id: reservationId,
        },
        relations: ['table'],
      });

      if (!reservation) {
        throw new NotFoundException(
          'Reservation not found or you do not have permission to cancel it.',
        );
      }

      if (!reservation.reser_status) {
        throw new ConflictException('Reservation is already canceled.');
      }

      reservation.reser_status = false;
      await this.reservationRepository.save(reservation);

      if (reservation.table) {
        const currentDateTime = new Date();
        const reservationDateTime = new Date(reservation.reser_date);

        currentDateTime.setHours(0, 0, 0, 0);
        reservationDateTime.setHours(0, 0, 0, 0);

        if (reservationDateTime.getTime() === currentDateTime.getTime()) {
          reservation.table.table_status = false;
          await this.tableRepository.save(reservation.table);
        }
      }
      return reservation || [];
    } catch (error) {
      console.error('Error when canceling reservation for restaurant:', error);
      throw new NotFoundException(
        'Error when canceling reservation for restaurant',
      );
    }
  }

  async getReservations(req: any, date?: string): Promise<reservation[]> {
    try {
      const user = await this.checkUser(req.user.id);
      const userRestaurant = user.adminRestaurant;

      const restaurantWithDetails =
        await this.restaurantRepository.findOneOrFail({
          where: { id: userRestaurant.id },
          relations: [
            'zones',
            'zones.tables',
            'zones.tables.reservations',
            'zones.tables.reservations.userClient',
          ],
        });

      const reservations = [];

      for (const zone of restaurantWithDetails.zones) {
        for (const table of zone.tables) {
          for (const reservation of table.reservations) {
            // Check if the reservation date matches the specified date
            if (date && reservation.reser_date !== date) {
              continue; // Skip to the next iteration if the dates don't match
            }

            reservations.push({
              reservationId: reservation.id,
              reser_time: reservation.reser_time,
              reser_date: reservation.reser_date,
              reser_status: reservation.reser_status,
              user: {
                username: reservation.userClient.username,
              },
              table: {
                table_number: table.table_number,
              },
            });
          }
        }
      }

      return reservations;
    } catch (error) {
      console.error('Error when getting reservations for restaurant:', error);
      throw new NotFoundException(
        'Error when getting reservations for restaurant',
      );
    }
  }

  async getReservationsByTableId(tableId: string): Promise<reservation[]> {
    try {
      const table = await this.tableRepository.findOne({
        where: { id: tableId },
        relations: ['reservations'],
      });

      if (!table) {
        throw new NotFoundException('Table not found.');
      }

      return table.reservations || [];
    } catch (error) {
      console.error('Error when getting reservations by table ID:', error);
      throw new NotFoundException(
        'Error when getting reservations by table ID',
      );
    }
  }

  async deleteAdmin(username: string, req: any): Promise<any> {
    try {
      const currentUserId = req.user.id;

      const currentUser = await this.adminRepository.findOne({
        where: { id: currentUserId },
        relations: ['adminRestaurant'],
      });

      if (!currentUser || !currentUser.adminRestaurant) {
        throw new UnauthorizedException(
          'User or associated restaurant not found.',
        );
      }

      const adminToDelete = await this.adminRepository.findOne({
        where: { username },
        relations: ['adminRestaurant'],
      });

      if (!adminToDelete) {
        throw new NotFoundException('Admin user to be deleted not found.');
      }

      if (
        adminToDelete.adminRestaurant &&
        adminToDelete.adminRestaurant.id !== currentUser.adminRestaurant.id
      ) {
        throw new ConflictException(
          'Admin user is associated with another restaurant.',
        );
      }

      adminToDelete.adminRestaurant = null;

      await this.adminRepository.save(adminToDelete);
      return { message: 'Admin deleted successfully.' };
    } catch (error) {
      console.error('Error when deleting admin from restaurant:', error);
      throw new ConflictException('Error when deleting admin from restaurant');
    }
  }
}
