import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { user } from 'src/entities';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(user) private readonly userRepository: Repository<user>,
  ) {}

  async findOne(username: string): Promise<user | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user;
  }
}
