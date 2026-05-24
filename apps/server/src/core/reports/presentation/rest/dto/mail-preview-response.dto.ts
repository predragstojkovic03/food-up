import { IMailPreview } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class MailPreviewResponseDto implements IMailPreview {
  @ApiProperty()
  @Expose()
  supplierId: string;

  @ApiProperty()
  @Expose()
  subject: string;

  @ApiProperty()
  @Expose()
  introText: string;

  @ApiProperty()
  @Expose()
  html: string;
}
