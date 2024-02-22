import {
  BadRequestException,
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
      throw error;
    }
  }

  async getZoneByRestaurantId(restaurantId: string): Promise<any> {
    try {
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
          createdAt: zone.createdAt,
          updatedAt: zone.updatedAt,
          tables: zone.tables,
        }),
      );

      return zonesWithTables;
    } catch (error) {
      throw error;
    }
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
      throw new ConflictException({
        message: ['Somethings wrong I can feel it.'],
      });
    }
  }

  async createProfileWithPhoto(createProfileDto: createProfileDto, photo: any, user: any): Promise<profile> {
    // Handle profile creation logic
    const { first_name, last_name, phone_number } = createProfileDto;
    const profile = this.profileRepository.create({
      first_name,
      last_name,
      phone_number,
      user,
      photo: photo.filename, // Assuming 'photo' is the field name and 'filename' is the property with the saved filename
    });

    // Save profile to the database
    await this.profileRepository.save(profile);

    return profile;
  }

  // async uploadPhoto(
  //   createPhotoDto: CreatePhotoDto,
  //   user: user_clients,
  // ): Promise<string> {
  //   try {
  //     const file = createPhotoDto.photo;
  //     if (!file) {
  //       throw new ConflictException('No file provided for upload.');
  //     }

  //     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
  //     const extension = extname(file.originalname);
  //     const filename = `${uniqueSuffix}${extension}`;

  //     const destination = './uploads'; // Adjust the destination path as needed

  //     // Save the file to the specified destination
  //     await this.saveFile(file, destination, filename);

  //     // Assuming you want to save the file path in the user's profile
  //     const photoPath = `${destination}/${filename}`;

  //     // Update user's profile with the photo path
  //     await this.updateUserProfile(user, { photo: photoPath });

  //     return photoPath;
  //   } catch (error) {
  //     throw new ConflictException('Error uploading photo.');
  //   }
  // }

  // private async saveFile(
  //   file: any,
  //   destination: string,
  //   filename: string,
  // ): Promise<void> {
  //   // Implementation for saving the file (similar to what you already have)
  // }

  // private async updateUserProfile(
  //   user: user_clients,
  //   data: Partial<profile>,
  // ): Promise<void> {
  //   try {
  //     const userProfile = await this.profileRepository.findOne({
  //       where: { user },
  //     });
  //     if (userProfile) {
  //       await this.profileRepository.update(userProfile.id, data);
  //     }
  //   } catch (error) {
  //     throw new ConflictException('Error updating user profile.');
  //   }
  // }
}
