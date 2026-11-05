import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { BusinessResponseDto } from './business-response.dto';

export class OnboardedManagerResponseDto {
  @ApiProperty() @Expose() id: string;
  @ApiProperty() @Expose() name: string;
  @ApiProperty() @Expose() email: string;
}

export class OnboardBusinessResponseDto {
  @ApiProperty({ type: BusinessResponseDto })
  @Expose()
  @Type(() => BusinessResponseDto)
  business: BusinessResponseDto;

  @ApiProperty({ type: OnboardedManagerResponseDto })
  @Expose()
  @Type(() => OnboardedManagerResponseDto)
  manager: OnboardedManagerResponseDto;
}
