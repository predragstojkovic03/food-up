import { ISendReport, ISendReportItem } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsNotEmpty, IsString, ValidateNested } from 'class-validator';

export class SendReportItemDto implements ISendReportItem {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  supplierId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  subject: string;

  @ApiProperty()
  @IsString()
  introText: string;
}

export class SendReportDto implements ISendReport {
  @ApiProperty()
  @IsString()
  windowId: string;

  @ApiProperty({ type: [SendReportItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SendReportItemDto)
  suppliers: SendReportItemDto[];
}
