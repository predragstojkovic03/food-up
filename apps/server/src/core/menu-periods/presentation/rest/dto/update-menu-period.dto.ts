import { ApiProperty } from '@nestjs/swagger';

export class UpdateMenuPeriodDto {
  @ApiProperty({
    example: '2025-08-01',
    description: 'Start date of the menu period',
    type: String,
    required: false,
  })
  startDate?: Date;

  @ApiProperty({
    example: '2025-08-31',
    description: 'End date of the menu period',
    type: String,
    required: false,
  })
  endDate?: Date;

  @ApiProperty({
    example: 'supplier-uuid',
    description: 'Supplier ID',
    required: false,
  })
  supplierId?: string;
}
