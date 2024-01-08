import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user_restaurant } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class ManagersService {
    constructor(
        @InjectRepository(user_restaurant) private readonly managerRepository: Repository<user_restaurant>,
      ) {}
    
      async findOne(username: string): Promise<user_restaurant | undefined> {
        const user = await this.managerRepository.findOne({ where: { username } });
        return user;
      }
}
