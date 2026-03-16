import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class BusinessInviteResponseDto {
  @ApiProperty()
  @Expose()
  token: string;

  @ApiProperty()
  @Expose()
  email: string;

  @ApiProperty()
  @Expose()
  expiresAt: Date;
}
