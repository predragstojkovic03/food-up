import { IsEnum, IsOptional } from 'class-validator';
import { IUpdateUserPreferences, Language, ThemePreference } from '@food-up/shared';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateUserPreferencesRequestDto implements IUpdateUserPreferences {
  @ApiPropertyOptional({ enum: ThemePreference })
  @IsEnum(ThemePreference)
  @IsOptional()
  theme?: ThemePreference;

  @ApiPropertyOptional({ enum: Language })
  @IsEnum(Language)
  @IsOptional()
  language?: Language;
}
