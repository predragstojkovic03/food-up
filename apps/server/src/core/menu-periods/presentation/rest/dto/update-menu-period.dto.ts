import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsOptional, IsString } from 'class-validator';

export class UpdateMenuPeriodDto {
  @ApiProperty({
    example: '2025-08-01',
    description: 'Start date of the menu period',
    type: String,
    required: false,
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiProperty({
    example: '2025-08-31',
    description: 'End date of the menu period',
    type: String,
    required: false,
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  @ApiProperty({
    example: 'supplier-uuid',
    description: 'Supplier ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  supplierId?: string;
}
