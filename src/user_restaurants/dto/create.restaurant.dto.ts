import { IsNotEmpty } from 'class-validator';

export class CreateRestaurantDto {
  @IsNotEmpty()
  rest_name: string;

  @IsNotEmpty()
  rest_description: string;

  @IsNotEmpty()
  rest_phone_number: string;
}