import { Expose } from 'class-transformer';
import { IsEmail, IsString } from 'class-validator';

export class CreateBusinessRequestDto {
  @IsString()
  name: string;

  @IsEmail()
  contactEmail: string;
}

@Expose()
export class CreateBusinessResponseDto {
  id: string;
  name: string;
  contactEmail: string;
}
