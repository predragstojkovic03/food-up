import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import { IUpdateBusinessLanguage, Language } from '@food-up/shared';

export class UpdateBusinessLanguageRequestDto implements IUpdateBusinessLanguage {
  @ApiProperty({ enum: Language })
  @IsEnum(Language)
  language: Language;
}
