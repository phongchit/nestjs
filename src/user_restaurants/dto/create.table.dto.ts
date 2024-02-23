import { IsNotEmpty, IsOptional } from 'class-validator';

export class CreateTableDto {
  @IsNotEmpty()
  table_capacity: string;

  @IsOptional()
  table_describe?: string;

  @IsNotEmpty()
  table_number: string;
}
