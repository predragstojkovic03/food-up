import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ThemePreference } from '@food-up/shared';
import { IUserPreferencesResponse } from '@food-up/shared';

export class UserPreferencesResponseDto implements IUserPreferencesResponse {
  @ApiProperty({ enum: ThemePreference })
  @Expose()
  theme: ThemePreference;
}
