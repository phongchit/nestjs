import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { restaurant, table, user_restaurant, zone_table } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create.restaurant.dto';
import { CreateZoneDto } from './dto/create.zone.dto';
import { CreateTableDto } from './dto/create.table.dto';
import { UpdateRestaurantDto } from './dto/update.restaurant.dto';
import { reservation } from 'src/entities/reservation.entity';
import { UpdateZoneDto } from './dto/update.zone.dto';
import * as fs from 'fs';
import * as path from 'path';
import { UpdateTableDto } from './dto/update.table.dto';

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

  async getprofile(user: user_restaurant): Promise<user_restaurant> {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException();
      }

      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
      });

      if (admin) {
        delete admin.password;
        delete admin.createdAt;
        delete admin.updatedAt;
        delete admin.id;
      }
      return admin;
    } catch (error) {
      throw new ConflictException();
    }
  }

  async createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
    user: user_restaurant,
  ): Promise<restaurant> {
    const { rest_name, rest_description, rest_phone_number } =
      createRestaurantDto;

    const admin = await this.adminRepository.findOne({
      where: { id: user.id },
      relations: ['adminRestaurant'],
    });

    if (admin.adminRestaurant) {
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
      throw new ConflictException('Error when creating restaurant');
    }
  }

  async getRestaurant(user: user_restaurant): Promise<restaurant> {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    const admin = await this.adminRepository.findOne({
      where: { id: user.id },
      relations: ['adminRestaurant'],
    });

    if (!admin || !admin.adminRestaurant) {
      throw new NotFoundException('User or associated restaurant not found.');
    }

    const restaurant = admin.adminRestaurant;

    if (!restaurant) {
      throw new NotFoundException('Restaurant not found.');
    }
    try {
      return restaurant;
    } catch (error) {
      throw new NotFoundException('Error when getting restaurant');
    }
  }

  async updateRestaurantphoto(
    user: user_restaurant,
    photo: Express.Multer.File,
  ): Promise<restaurant> {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    const admin = await this.adminRepository.findOne({
      where: { id: user.id },
      relations: ['adminRestaurant'],
    });

    const restaurant = admin.adminRestaurant;

    if (restaurant.photo) {
      const photoPath = path.join(
        __dirname,
        '../../restaurants/',
        restaurant.photo,
      );
      fs.unlinkSync(photoPath);
    }

    restaurant.photo = photo.filename;

    try {
      await this.restaurantRepository.save(restaurant);
      return restaurant;
    } catch (error) {
      throw new ConflictException();
    }
  }

  async getRestaurantPhoto(user: user_restaurant): Promise<string> {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }

      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });
      return admin.adminRestaurant.photo;
    } catch (error) {
      throw new NotFoundException('Error when getting profile photo');
    }
  }

  async updateRestaurant(
    updateRestaurantDto: UpdateRestaurantDto,
    @Request() user: user_restaurant,
  ): Promise<restaurant> {
    const { rest_name, rest_description, rest_phone_number } =
      updateRestaurantDto;

    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurant = admin.adminRestaurant;

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
      throw new ConflictException('Error when updating restaurant');
    }
  }

  async deleteRestaurant(user: user_restaurant): Promise<void> {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurant = admin.adminRestaurant;

      const deleteRestaurant = await this.restaurantRepository.findOne({
        where: { id: restaurant.id },
      });

      if (!deleteRestaurant) {
        throw new NotFoundException('Restaurant not found.');
      }

      // Delete the restaurant
      await this.restaurantRepository.remove(deleteRestaurant);
    } catch (error) {
      throw new ConflictException('Error when deleting restaurant');
    }
  }

  async createZone(
    createZoneDto: CreateZoneDto,
    @Request() user: user_restaurant,
  ): Promise<zone_table> {
    const { zone_name, zone_descripe } = createZoneDto;

    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!user) {
        throw new NotFoundException('User not found.');
      }

      const restaurant = admin.adminRestaurant;

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

  async updateprofilephoto(
    user: user_restaurant,
    photo: Express.Multer.File,
  ): Promise<user_restaurant> {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    const admin = await this.adminRepository.findOne({
      where: { id: user.id },
    });

    if (admin.photo) {
      const photoPath = path.join(__dirname, '../../profile/', admin.photo);
      fs.unlinkSync(photoPath);
    }

    admin.photo = photo.filename;

    try {
      await this.adminRepository.save(admin);
      return admin;
    } catch (error) {
      throw new ConflictException();
    }
  }

  async getProfilePhoto(user: user_restaurant): Promise<string> {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }

      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
      });
      return admin.photo;
    } catch (error) {
      throw new NotFoundException('Error when getting profile photo');
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
      throw new NotFoundException('Zone not found.');
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

  async getZones(user: user_restaurant): Promise<zone_table[]> {
    try {
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!user || !user.id) {
        throw new UnauthorizedException(
          'User or associated restaurant not found.',
        );
      }

      const restaurantId = admin.adminRestaurant.id;
      const zones = await this.zoneRepository.find({
        where: { restaurant: { id: restaurantId } },
      });

      return zones;
    } catch (error) {
      throw new UnauthorizedException('Error when getting zones for admin');
    }
  }

  async deleteZone(zoneId: string, user: user_restaurant): Promise<void> {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurantId = admin.adminRestaurant.id;

      const existingZone = await this.zoneRepository.findOne({
        where: { id: zoneId, restaurant: { id: restaurantId } },
      });

      if (!existingZone) {
        throw new NotFoundException('Zone not found.');
      }

      await this.zoneRepository.remove(existingZone);
    } catch (error) {
      throw new ConflictException('Error when deleting zone');
    }
  }

  async createTable(
    createTableDto: CreateTableDto,
    @Request() user: user_restaurant,
    zoneId: string,
  ): Promise<table> {
    const { table_number, table_capacity, table_describe } = createTableDto;

    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurant = admin.adminRestaurant;
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
      });

      return await this.tableRepository.save(newTable);
    } catch (error) {
      throw new ConflictException('Error when creating table');
    }
  }

  async uploadTablephoto(
    user: user_restaurant,
    photo: Express.Multer.File,
    tableId: string,
  ): Promise<table> {
    const table = await this.tableRepository.findOne({
      where: { id: tableId },
    });
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    if (!table) {
      throw new NotFoundException();
    }

    if (table.photo) {
      const tablePath = path.join(__dirname, '../../tables/', table.photo);
      fs.unlinkSync(tablePath);
    }

    table.photo = photo.filename;
    try {
      await this.tableRepository.save(table);
      return table;
    } catch (error) {
      throw new ConflictException();
    }
  }

  async getTablePhoto(user: user_restaurant, tableId: string): Promise<string> {
    try {
      const table = await this.tableRepository.findOne({
        where: { id: tableId },
      });

      if (!table || !table.photo) {
        throw new NotFoundException('Table not found.');
      }

      return table.photo;
    } catch (error) {
      throw new NotFoundException('Error when getting table photo');
    }
  }

  async getTables(user: any, zoneId: string): Promise<table[]> {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }

      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurant = admin.adminRestaurant;

      const zones = await this.zoneRepository.findOne({
        where: { id: zoneId, restaurant: { id: restaurant.id } },
        relations: ['tables'],
      });

      if (!zones) {
        throw new NotFoundException('Zone not found.');
      }

      return zones.tables || [];
    } catch (error) {
      throw new NotFoundException('Error when getting tables for zone');
    }
  }

  async deleteTable(tableId: string, user: any): Promise<void> {
    if (!user || !user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    try {
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurantId = admin.adminRestaurant.id;

      const table = await this.tableRepository.findOne({
        where: { id: tableId, zone: { restaurant: { id: restaurantId } } },
      });

      if (!table) {
        throw new NotFoundException('Table not found.');
      }

      await this.tableRepository.remove(table);
    } catch (error) {
      throw new ConflictException('Error when deleting table');
    }
  }

  async getTableByTableId(
    tableId: string,
    user: user_restaurant,
  ): Promise<table> {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }
      const table = await this.tableRepository.findOne({
        where: { id: tableId },
      });

      if (!table) {
        throw new NotFoundException('Table not found.');
      }

      return table;
    } catch (error) {
      throw new NotFoundException('Error when getting table by tableId');
    }
  }

  async updateTable(
    updateTableDto: UpdateTableDto,
    user: user_restaurant,
    tableId: string,
  ): Promise<table> {
    const { table_number, table_capacity, table_describe } = updateTableDto;

    try {
      if (!user || !user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }

      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const restaurantId = admin.adminRestaurant.id;

      const table = await this.tableRepository.findOne({
        where: { id: tableId, zone: { restaurant: { id: restaurantId } } },
      });

      if (!table) {
        throw new NotFoundException('Table not found.');
      }

      // Update table information
      if (table_number) table.table_number = table_number;
      if (table_capacity) table.table_capacity = table_capacity;
      if (table_describe) table.table_describe = table_describe;

      return await this.tableRepository.save(table);
    } catch (error) {
      throw new ConflictException('Error when updating table');
    }
  }

  async addAdmin(
    username: string,
    user: user_restaurant,
  ): Promise<user_restaurant> {
    try {
      const currentUserId = user.id;

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
      throw new ConflictException('Error when adding admin to restaurant');
    }
  }

  async cancelReservation(
    reservationId: string,
    user: user_restaurant,
  ): Promise<any> {
    try {
      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
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
      throw new NotFoundException(
        'Error when canceling reservation for restaurant',
      );
    }
  }

  async getReservations(
    user: user_restaurant,
    date?: string,
  ): Promise<reservation[]> {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }

      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }
      const userRestaurant = admin.adminRestaurant;

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
            if (date && reservation.reser_date !== date) {
              continue; // Skip to the next iteration if the dates don't match
            }

            reservations.push({
              id: reservation.id,
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
      throw new NotFoundException(
        'Error when getting reservations for restaurant',
      );
    }
  }

  async deleteAdmin(username: string, user: user_restaurant): Promise<any> {
    try {
      const currentUserId = user.id;

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
      throw new ConflictException('Error when deleting admin from restaurant');
    }
  }

  async getReservationById(
    reservationId: string,
    user: user_restaurant,
  ): Promise<reservation> {
    try {
      if (!user || !user.id) {
        throw new UnauthorizedException(
          'User information not found in the request.',
        );
      }

      const admin = await this.adminRepository.findOne({
        where: { id: user.id },
        relations: ['adminRestaurant'],
      });

      if (!admin || !admin.adminRestaurant) {
        throw new NotFoundException('User or associated restaurant not found.');
      }

      const reservation = await this.reservationRepository.findOne({
        where: { id: reservationId },
        relations: ['table', 'userClient'],
      });

      if (!reservation) {
        throw new NotFoundException('Reservation not found.');
      } else {
        delete reservation.createdAt;
        delete reservation.updatedAt;
      }
      if (reservation.userClient) {
        delete reservation.userClient.password;
        delete reservation.userClient.createdAt;
        delete reservation.userClient.updatedAt;
        delete reservation.userClient.email;
        delete reservation.userClient.id;
      }
      if (reservation.table) {
        delete reservation.table.createdAt;
        delete reservation.table.updatedAt;
        delete reservation.table.photo;
        delete reservation.table.table_status;
        delete reservation.table.id;
      }

      return reservation;
    } catch (error) {
      throw new NotFoundException('Error when getting reservation.');
    }
  }
}
