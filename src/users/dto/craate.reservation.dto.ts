import { IsUUID, IsDateString, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty({ message: 'Table is required.' })
  tableId: string;

  @IsDateString({}, { message: 'Invalid date format for reser_date.' })
  @IsNotEmpty({ message: 'Reservation date is required.' })
  reser_date: string;

  @IsNotEmpty({ message: 'Reservation time is required.' })
  reser_time: string;
}