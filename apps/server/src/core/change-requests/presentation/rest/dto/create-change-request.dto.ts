import { ApiProperty } from '@nestjs/swagger';

export class CreateChangeRequestDto {
  @ApiProperty({ example: 'employee-uuid', description: 'Employee ID' })
  employeeId: string;

  @ApiProperty({
    example: 'meal-selection-uuid',
    description: 'Meal selection ID',
  })
  mealSelectionId: string;

  @ApiProperty({ example: 'menu-item-uuid', description: 'New menu item ID' })
  newMenuItemId: string;

  @ApiProperty({
    example: 2,
    description: 'New quantity',
    required: false,
    nullable: true,
  })
  newQuantity?: number | null;

  @ApiProperty({
    example: 'pending',
    enum: ['pending', 'approved', 'rejected'],
    description: 'Status of the change request',
  })
  status: 'pending' | 'approved' | 'rejected';

  @ApiProperty({
    example: 'manager-uuid',
    description: 'Approved by',
    required: false,
    nullable: true,
  })
  approvedBy?: string | null;

  @ApiProperty({
    example: '2025-08-15T12:00:00Z',
    description: 'Approval date',
    required: false,
    nullable: true,
    type: String,
  })
  approvedAt?: Date | null;
}
