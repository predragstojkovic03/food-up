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
      'List every employee in XLSX day sheets: skipped days in grey, no selection at all in red',
  })
  @IsOptional()
  @IsBoolean()
  reportIncludeEmployeesWithoutSelection?: boolean;
}
