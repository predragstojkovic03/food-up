import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsString } from 'class-validator';

export class CreateMenuPeriodDto {
  @ApiProperty({
    example: '2025-08-01',
    description: 'Start date of the menu period',
    type: String,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  startDate: Date;

  @ApiProperty({
    example: '2025-08-31',
    description: 'End date of the menu period',
    type: String,
  })
  @IsDate()
  @Transform(({ value }) => new Date(value))
  endDate: Date;

  @ApiProperty({ example: 'supplier-uuid', description: 'Supplier ID' })
  @IsString()
  supplierId: string;
}
