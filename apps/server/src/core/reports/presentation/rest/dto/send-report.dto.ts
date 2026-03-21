import { ISendReport } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsString } from 'class-validator';

export class SendReportDto implements ISendReport {
  @ApiProperty()
  @IsString()
  windowId: string;

  @ApiProperty({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  supplierIds: string[];
}
