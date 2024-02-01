import { ConflictException, Injectable, NotFoundException, Request, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { restaurant, user_restaurant } from 'src/entities';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create.restaurant.dto';

@Injectable()
export class UserRestaurantsService {
  constructor(
    @InjectRepository(user_restaurant)
    private adminRepository: Repository<user_restaurant>,
    @InjectRepository(restaurant)
    private restaurantRepository: Repository<restaurant>,
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
    const { rest_name, rest_description, rest_phone_number } = createRestaurantDto;
  
    // Check if req.user or req.user.id is undefined
    if (!req.user || !req.user.id) {
      throw new UnauthorizedException('User information not found in the request.');
    }
  
    // Check if the restaurant name is unique
    const existingRestaurant = await this.restaurantRepository.findOne({
      where: { rest_name },
    });
  
    if (existingRestaurant) {
      throw new ConflictException('Restaurant with the same name already exists');
    }
  
    const newRestaurant = this.restaurantRepository.create({
      rest_name,
      rest_description,
      rest_phone_number,
      admins: [], // You might not need to link admins here, as you'll update it later
    });
  
    try {
      const createdRestaurant = await this.restaurantRepository.save(newRestaurant);
  
      // Update adminRestaurant property of the admin user with the new restaurant ID
      const admin = await this.adminRepository.findOne({ where: { id: req.user.id } });
  
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
}
