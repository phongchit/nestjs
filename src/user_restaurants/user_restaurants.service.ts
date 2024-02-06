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
  ) {}

  async findOne(username: string): Promise<user_restaurant | undefined> {
    const user = await this.adminRepository.findOne({ where: { username } });
    return user;
  }

  async findrestaurant(rest_name: string): Promise<restaurant | undefined> {
    const restaurant = await this.restaurantRepository.findOne({
      where: { rest_name },
    });
    return restaurant;
  }

  async createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
    @Request() req,
  ): Promise<restaurant> {
    const { rest_name, rest_description, rest_phone_number } =
      createRestaurantDto;

    if (!req.user || !req.user.id) {
      throw new UnauthorizedException(
        'User information not found in the request.',
      );
    }

    const user = await this.adminRepository.findOne({
      where: { id: req.user.id },
      relations: ['adminRestaurant'],
    });

    if (user.adminRestaurant) {
      throw new BadRequestException('User must have 1 Restaurant.');
    }

    const existingRestaurant = await this.restaurantRepository.findOne({
      where: { rest_name },
    });

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

      const admin = await this.adminRepository.findOne({
        where: { id: req.user.id },
      });

      if (!admin) {
        throw new NotFoundException('Admin user not found.');
      }

      admin.adminRestaurant = createdRestaurant;
      await this.adminRepository.save(admin);

      return createdRestaurant;
    } catch (error) {
      console.error('Error when creating restaurant:', error);
      throw new ConflictException('Error when creating restaurant');
    }
  }

  async createZone(createZoneDto: CreateZoneDto, @Request() req): Promise<zone_table> {
    const { zone_name, zone_descripe } = createZoneDto;
  
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User information not found in the request.');
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

      console.log(restaurant)
  
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
      console.error('Error when creating zone:', error);
      throw new ConflictException('Error when creating zone');
    }
  }

  async getZones(userId: string): Promise<zone_table[]> {
    try {
      const user = await this.adminRepository.findOne({
        where: { id: userId },
        relations: ['adminRestaurant'],
      });

      if (!user || !user.adminRestaurant) {
        throw new UnauthorizedException('User or associated restaurant not found.');
      }

      const restaurantId = user.adminRestaurant.id;
      const zones = await this.zoneRepository.find({ where: { restaurant: { id: restaurantId } } });

      return zones;
    } catch (error) {
      console.error('Error when getting zones for admin:', error);
      throw new UnauthorizedException('Error when getting zones for admin');
    }
  }  

  async createTable(createTableDto: CreateTableDto, @Request() req, zoneId: string): Promise<table> {
    const { table_number, table_capacity, table_describe } = createTableDto;

    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User information not found in the request.');
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
      });

      return await this.tableRepository.save(newTable);
    } catch (error) {
      console.error('Error when creating table:', error);
      throw new ConflictException('Error when creating table');
    }
  }
}
