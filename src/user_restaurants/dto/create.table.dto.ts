import { IsNotEmpty, IsOptional } from 'class-validator';
import { table } from 'console';

export class CreateTableDto {
  @IsNotEmpty()
  table_capacity: string;

  @IsOptional()
  table_describe?: string;

  @IsNotEmpty()
  table_number: string;
}