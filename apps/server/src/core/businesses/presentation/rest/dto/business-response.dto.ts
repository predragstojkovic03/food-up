import { ApiProperty } from '@nestjs/swagger';
import { Language } from '@food-up/shared';
import { Expose } from 'class-transformer';

export class BusinessResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() contactEmail: string;
  @ApiProperty({ enum: Language }) @Expose() language: Language;
}
