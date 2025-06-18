import { IsEmail, IsString } from 'class-validator';

export class CreateBusinessRequestDto {
  @IsString()
  name: string;

  @IsEmail()
  contactEmail: string;
}
