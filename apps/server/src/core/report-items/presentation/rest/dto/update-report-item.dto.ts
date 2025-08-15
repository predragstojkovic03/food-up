import { ApiProperty } from '@nestjs/swagger';

export class UpdateReportItemDto {
  @ApiProperty({
    example: 'report-uuid',
    description: 'Report ID',
    required: false,
  })
  reportId?: string;

  @ApiProperty({
    example: 'menu-item-uuid',
    description: 'Menu item ID',
    required: false,
  })
  menuItemId?: string;

  @ApiProperty({
    example: '2025-08-15',
    description: 'Date of the report item',
    type: String,
    required: false,
  })
  date?: Date;

  @ApiProperty({ example: 10, description: 'Quantity', required: false })
  quantity?: number;
}
