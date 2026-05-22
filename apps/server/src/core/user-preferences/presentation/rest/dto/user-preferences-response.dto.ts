import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IUserPreferencesResponse, Language, ThemePreference } from '@food-up/shared';

export class UserPreferencesResponseDto implements IUserPreferencesResponse {
  @ApiProperty({ enum: ThemePreference })
  @Expose()
  theme: ThemePreference;

  @ApiProperty({ enum: Language })
  @Expose()
  language: Language;
}
