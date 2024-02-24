import { IsOptional } from 'class-validator';

export class UpdateZoneDto {
  @IsOptional()
  zone_name?: string;

  @IsOptional()
  zone_descripe?: string;
}
