import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user_clients } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(user_clients) private readonly userRepository: Repository<user_clients>,
  ) {}

  async findOne(username: string): Promise<user_clients | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user;
  }
}
