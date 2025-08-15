import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuPeriodDto {
  @ApiProperty({
    example: '2025-08-01',
    description: 'Start date of the menu period',
    type: String,
  })
  startDate: Date;

  @ApiProperty({
    example: '2025-08-31',
    description: 'End date of the menu period',
    type: String,
  })
  endDate: Date;

  @ApiProperty({ example: 'supplier-uuid', description: 'Supplier ID' })
  supplierId: string;
}
