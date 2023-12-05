import { IsNotEmpty, MinLength } from 'class-validator';

export class SignUpUserDto {
  @IsNotEmpty()
  username: string;

  @MinLength(8)
  password: string;
}
