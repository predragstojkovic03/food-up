import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AuthResponseDto {
  @ApiProperty({ name: 'access_token', description: 'JWT access token' })
  @Expose()
  access_token: string;
}
