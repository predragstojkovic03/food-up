import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsOptional } from 'class-validator';
import { IUpdateBusinessSettings, Language } from '@food-up/shared';

export class UpdateBusinessSettingsRequestDto implements IUpdateBusinessSettings {
  @ApiPropertyOptional({ enum: Language })
  @IsOptional()
  @IsEnum(Language)
  language?: Language;

  @ApiPropertyOptional({
    description:
      'Include employees with no selection for a day (not even a skip) in XLSX day sheets',
  })
  @IsOptional()
  @IsBoolean()
  reportIncludeEmployeesWithoutSelection?: boolean;
}
