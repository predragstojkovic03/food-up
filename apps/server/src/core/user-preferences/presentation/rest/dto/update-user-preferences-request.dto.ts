import { IsEnum } from 'class-validator';
import { IUpdateUserPreferences, ThemePreference } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateUserPreferencesRequestDto implements IUpdateUserPreferences {
  @ApiProperty({ enum: ThemePreference })
  @IsEnum(ThemePreference)
  theme: ThemePreference;
}
