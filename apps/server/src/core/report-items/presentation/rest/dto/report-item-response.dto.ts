import { ApiProperty } from '@nestjs/swagger';

export class ReportItemResponseDto {
  @ApiProperty({ example: 'report-item-uuid', description: 'Report item ID' })
  id: string;

  @ApiProperty({ example: 'report-uuid', description: 'Report ID' })
  reportId: string;

  @ApiProperty({ example: 'menu-item-uuid', description: 'Menu item ID' })
  menuItemId: string;

  @ApiProperty({
    example: '2025-08-15',
    description: 'Date of the report item',
    type: String,
  })
  date: Date;

  @ApiProperty({ example: 10, description: 'Quantity' })
  quantity: number;
}
