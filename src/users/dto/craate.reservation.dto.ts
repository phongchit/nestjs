import { IsDateString, IsNotEmpty } from 'class-validator';

export class CreateReservationDto {
  @IsNotEmpty()
  tableId: string;

  @IsDateString()
  @IsNotEmpty()
  reser_date: string;

  @IsNotEmpty()
  reser_time: string;
}
