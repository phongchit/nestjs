import { IsOptional } from "class-validator";

export class createProfileDto {
  @IsOptional()
  first_name: string;
  @IsOptional()
  last_name: string;
  @IsOptional()
  phone_number: string;
}
