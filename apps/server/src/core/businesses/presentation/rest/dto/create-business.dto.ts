import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class CreateBusinessRequestDto {
  @ApiProperty({ example: 'Acme Corp', description: 'Business name' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'contact@acme.com', description: 'Contact email' })
  @IsEmail()
  contactEmail: string;
}
