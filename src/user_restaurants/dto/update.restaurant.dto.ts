import { IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateRestaurantDto {
  @IsOptional()
  rest_name?: string;

  @IsOptional()
  rest_description?: string;

  @IsOptional()
  rest_phone_number?: string;
}