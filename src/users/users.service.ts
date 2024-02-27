import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
  profile,
  restaurant,
  table,
  user_clients,
  zone_table,
} from 'src/entities';
import { Repository } from 'typeorm';
import { createProfileDto } from './dto/create.profile.dto';
import { CreateReservationDto } from './dto/craate.reservation.dto';
import { reservation } from 'src/entities/reservation.entity';
import { updateProfileDto } from './dto/update.profile.dto';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(user_clients)
    private userRepository: Repository<user_clients>,
    @InjectRepository(profile) private profileRepository: Repository<profile>,
    @InjectRepository(reservation)
    private reservationRepository: Repository<reservation>,
    @InjectRepository(table) private tableRepository: Repository<table>,
    @InjectRepository(restaurant)
    private restaurantRepository: Repository<restaurant>,
    @InjectRepository(zone_table)
    private zone_tableRepository: Repository<zone_table>,
  ) {}

  async findOne(username: string): Promise<user_clients | undefined> {
    const user = await this.userRepository.findOne({ where: { username } });
    return user;
  }

  async findTable(id: string): Promise<table | undefined> {
    const table = await this.tableRepository.findOne({ where: { id } });
    return table;
  }

  async createReservation(
    createReservationDto: CreateReservationDto,
    user: user_clients,
  ): Promise<reservation> {
    try {
      const { tableId, reser_time, reser_date } = createReservationDto;

      const table = await this.findTable(tableId);

      if (!table) {
        throw new NotFoundException('Table not found.');
      }

      const currentDateTime = new Date();
      const reservationDateTime = new Date(`${reser_date} ${reser_time}`);

      if (reservationDateTime <= currentDateTime) {
        throw new ConflictException('Reservation date must be in the future.');
      }

      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

      if (reservationDateTime > sevenDaysFromNow) {
        throw new ConflictException(
          'Reservation date must be within the next 7 days.',
        );
      }

      const isTableAvailable = await this.isTableAvailableOnDate(
        tableId,
        reser_date,
      );

      if (!isTableAvailable) {
        throw new ConflictException(
          'Table is not available for reservation on the specified date.',
        );
      }

      const newReservation = this.reservationRepository.create({
        userClient: user,
        table,
        reser_time,
        reser_date,
      });

      await Promise.all([
        this.reservationRepository.save(newReservation),
        this.updateTableStatus(tableId, reser_date),
      ]);

      return newReservation;
    } catch (error) {
      throw error;
    }
  }

  private async isTableAvailableOnDate(
    tableId: string,
    reser_date: string,
  ): Promise<boolean> {
    const reservationCount = await this.reservationRepository.count({
      where: {
        table: { id: tableId },
        reser_date,
        reser_status: true,
      },
    });

    return reservationCount === 0;
  }

  private async updateTableStatus(
    tableId: string,
    reser_date: string,
  ): Promise<void> {
    const table = await this.findTable(tableId);

    if (table) {
      const currentDateTime = new Date();
      const reservationDateTime = new Date(reser_date);

      currentDateTime.setHours(0, 0, 0, 0);
      reservationDateTime.setHours(0, 0, 0, 0);

      if (reservationDateTime.getTime() === currentDateTime.getTime()) {
        table.table_status = true;
        await this.tableRepository.save(table);
      }
    }
  }

  async cancelReservation(
    reservationId: string,
    user: user_clients,
  ): Promise<reservation> {
    try {
      const reservation = await this.reservationRepository.findOne({
        where: { id: reservationId, userClient: { id: user.id } },
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
        reservation.table.table_status = false;
        await this.tableRepository.save(reservation.table);
      }
      return reservation;
    } catch (error) {
      throw error;
    }
  }

  async getAllRestaurants(): Promise<restaurant[]> {
    try {
      const restaurants = await this.restaurantRepository.find();
      return restaurants;
    } catch (error) {
      throw new error();
    }
  }

  async getZoneByRestaurantId(restaurantId: string): Promise<any> {
    const selectedRestaurant = await this.restaurantRepository.findOneOrFail({
      where: { id: restaurantId },
      relations: ['zones', 'zones.tables'],
    });

    if (!selectedRestaurant) {
      throw new NotFoundException('Restaurant not found.');
    }
    const zonesWithTables = selectedRestaurant.zones.map(
      (zone: zone_table) => ({
        id: zone.id,
        zone_name: zone.zone_name,
        zone_descripe: zone.zone_descripe,
        tables: zone.tables,
      }),
    );

    return zonesWithTables;
  }

  async getReservations(
    user: user_clients,
    date?: string,
  ): Promise<reservation[]> {
    try {
      const whereCondition: any = { userClient: user };

      if (date) {
        whereCondition.reser_date = date;
      }

      const userReservations = await this.reservationRepository.find({
        where: whereCondition,
        relations: ['table'],
      });

      return userReservations;
    } catch (error) {
      console.error('Error when getting user reservations:', error);
      throw new NotFoundException('Error when getting user reservations');
    }
  }

  async createProfile(
    createProfileDto: createProfileDto,
    user: user_clients,
  ): Promise<profile> {
    const { first_name, last_name, phone_number } = createProfileDto;
    const profile = this.profileRepository.create({
      first_name,
      last_name,
      phone_number,
      user,
    });
    await this.profileRepository.save(profile);

    return profile;
  }

  async getProfile(user: user_clients): Promise<profile> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { user },
      });
      if (!profile) {
        throw new NotFoundException();
      }
      return profile;
    } catch (error) {
      throw new NotFoundException();
    }
  }

  async updateProfile(
    updateprofileDto: updateProfileDto,
    user: user_clients,
  ): Promise<profile> {
    const { first_name, last_name, phone_number } = updateprofileDto;
    const existingProfile = await this.profileRepository.findOne({
      where: { user },
    });

    if (!existingProfile) {
      throw new NotFoundException('Profile not found.');
    }

    existingProfile.first_name = first_name || existingProfile.first_name;
    existingProfile.last_name = last_name || existingProfile.last_name;
    existingProfile.phone_number = phone_number || existingProfile.phone_number;

    try {
      await this.profileRepository.save(existingProfile);
      return existingProfile;
    } catch (e) {
      throw new ConflictException();
    }
  }

  async updateProfilephoto(
    user: user_clients,
    photo: Express.Multer.File,
  ): Promise<profile> {
    const Profile = await this.profileRepository.findOne({
      where: { user },
    });

    if (!Profile) {
      throw new NotFoundException('Profile not found.');
    }

    if (Profile.photo) {
      const photoPath = path.join(__dirname, '../../profile/', Profile.photo);
      fs.unlinkSync(photoPath);
    }

    Profile.photo = photo.filename;

    try {
      await this.profileRepository.save(Profile);
      return Profile;
    } catch (error) {
      console.error('Error saving updated profile:', error);

      throw new ConflictException();
    }
  }

  async deletePhoto(user: user_clients): Promise<void> {
    const profile = await this.profileRepository.findOne({
      where: { user },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }
    if (profile.photo) {
      const photoPath = path.join(__dirname, '../../profile/', profile.photo);
      fs.unlinkSync(photoPath);
      profile.photo = null;
      this.profileRepository.save(profile);
    }
  }

  async deleteProfile(user: user_clients): Promise<void> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { user },
      });

      if (!profile) {
        throw new NotFoundException('Profile not found');
      }
      if (profile.photo) {
        const photoPath = path.join(__dirname, '../../profile/', profile.photo);
        fs.unlinkSync(photoPath);
      }
      await this.profileRepository.remove(profile);
    } catch (error) {
      throw error;
    }
  }
  async getProfilePhoto(user: user_clients): Promise<string> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { user: { id: user.id } },
      });

      if (!profile || !profile.photo) {
        throw new NotFoundException('Profile or photo not found.');
      }

      return profile.photo;
    } catch (error) {
      console.error('Error when getting profile photo:', error);
      throw new NotFoundException('Error when getting profile photo');
    }
  }
}
