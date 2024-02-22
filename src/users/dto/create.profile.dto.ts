import { IsNotEmpty, IsOptional } from 'class-validator';

export class createProfileDto {
  @IsNotEmpty()
  first_name: string;

  @IsNotEmpty()
  last_name: string;

  @IsNotEmpty()
  phone_number: string;

}
