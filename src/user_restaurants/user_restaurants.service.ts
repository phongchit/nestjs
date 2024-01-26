import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user_restaurant } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UserRestaurantsService {
  constructor(
    @InjectRepository(user_restaurant)
    private employeeRepository: Repository<user_restaurant>,
  ) {}

  async findOne(username: string): Promise<user_restaurant | undefined> {
    const user = await this.employeeRepository.findOne({ where: { username } });
    return user;
  }
}
