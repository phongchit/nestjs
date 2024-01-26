import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { profile, user_clients } from 'src/entities';
import { Repository } from 'typeorm';
import { createProfileDto } from './dto/create.profile.dto';
import { updateProfileDto } from './dto/update.profile.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(user_clients)
    private userRepository: Repository<user_clients>,
    @InjectRepository(profile) private profileRepository: Repository<profile>,
  ) {}

  async findOne(username: string): Promise<user_clients | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user;
  }

  async createProfile(
    createprofiledto: createProfileDto,
    user: user_clients,
  ): Promise<profile> {
    const { first_name, last_name, phone_number } = createprofiledto;

    const profile = this.profileRepository.create({
      first_name,
      last_name,
      phone_number,
      user,
    });

    try {
      await this.profileRepository.save(profile);
      return profile;
    } catch (e) {
      throw new ConflictException();
    }
  }

  async getProfile(user: user_clients): Promise<profile> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { user },
      });
      return profile;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async getProfileById(id: string, user: user_clients): Promise<profile> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { user, id },
      });
      return profile;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async updateProfile(
    id: string,
    updateprofileDto: updateProfileDto,
    user: user_clients,
  ) {
    try {
      const profile = await this.getProfileById(id, user);

      const { first_name, last_name, phone_number } = updateprofileDto;

      if (first_name) {
        profile.first_name = first_name;
      }

      if (last_name) {
        profile.last_name = last_name;
      }

      if (phone_number) {
        profile.phone_number = phone_number;
      }

      await this.profileRepository.save(profile);
      return profile;
    } catch (e) {
      throw new NotFoundException();
    }
  }

  async deleteProfile(id: string, user: user_clients) {
    try {
      const profile = await this.getProfileById(id, user);
      await this.profileRepository.delete(id);
      return profile;
    } catch (error) {
      throw new NotFoundException();
    }
  }
}
