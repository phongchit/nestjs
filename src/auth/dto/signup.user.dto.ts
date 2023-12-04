import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class SignUpUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  username: string;

  @MinLength(8)
  password: string;
}
