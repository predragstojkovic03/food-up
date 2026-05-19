import { IsEnum } from 'class-validator';
import { ThemePreference } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPreferencesRequestDto {
  @ApiProperty({ enum: ThemePreference })
  @IsEnum(ThemePreference)
  theme: ThemePreference;
}
