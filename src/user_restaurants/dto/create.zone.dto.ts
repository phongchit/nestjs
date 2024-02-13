import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateZoneDto {
  @IsNotEmpty()
  zone_name: string;

  @IsOptional()
  zone_descripe?: string;
}
