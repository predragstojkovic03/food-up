import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateBusinessInviteRequestDto {
  @ApiProperty()
  @IsEmail()
  email: string;
}
