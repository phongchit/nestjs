import { IsNotEmpty } from 'class-validator';

export class UpdatePhotoDto {
  @IsNotEmpty()
  newPhoto: any;
}