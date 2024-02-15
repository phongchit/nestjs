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
import { updateProfileDto } from './dto/update.profile.dto';
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

  async createProfile(
    createprofiledto: createProfileDto,
    user: user_clients,
  ): Promise<profile> {
    const { first_name, last_name, phone_number } = createprofiledto;

    const profile = this.profileRepository.create({
      first_name,
      last_name,
      phone_number,
      user: user,
    });

    try {
      await this.profileRepository.save(profile);
      return profile;
    } catch (error) {
      throw new ConflictException();
    }
  }

  async getProfile(user: user_clients): Promise<profile> {
    try {
      const profile = await this.profileRepository.findOne({
        where: { id: user.id },
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
    } catch (error) {
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

      if (table.table_status) {
        throw new ConflictException('Table is not available for reservation.');
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
    const existingReservations = await this.reservationRepository.find({
      where: {
        table: { id: tableId },
        reser_date,
        reser_status: true,
      },
    });

    return existingReservations.length === 0;
  }

  private async updateTableStatus(
    tableId: string,
    reser_date: string,
  ): Promise<void> {
    const table = await this.findTable(tableId);
    if (table) {
      const currentDateTime = new Date();
      const reservationDateTime = new Date(`${reser_date} 00:00:00`);

      if (
        reservationDateTime.getDate() === currentDateTime.getDate() &&
        reservationDateTime.getMonth() === currentDateTime.getMonth() &&
        reservationDateTime.getFullYear() === currentDateTime.getFullYear()
      ) {
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
        where: { id: reservationId, userClient: user },
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

      return { zones: zonesWithTables };
    } catch (error) {
      throw error;
    }
  }

  async getTableDetailsById(tableId: string): Promise<table> {
    try {
      const tableDetails = await this.tableRepository.findOne({
        where: { id: tableId },
        relations: ['zone'],
      });

      return tableDetails;
    } catch (error) {
      console.error('Error when getting table details:', error);
      throw new NotFoundException('Table not found.');
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
}
