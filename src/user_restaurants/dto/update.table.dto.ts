import { IsOptional } from 'class-validator';

export class UpdateTableDto {
  @IsOptional()
  table_capacity?: string;

  @IsOptional()
  table_describe?: string;

  @IsOptional()
  table_number: string;
}
