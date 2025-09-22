import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { ulid } from 'ulid';

export class ChangeRequestResponseDto {
  @ApiProperty({
    description: 'Unique identifier for the change request',
    example: ulid(),
  })
  @Expose()
  id: string;

  @ApiProperty({
    description: 'Unique identifier for the employee',
    example: ulid(),
  })
  @Expose()
  employeeId: string;

  @ApiProperty({
    description: 'Unique identifier for the meal selection',
    example: ulid(),
  })
  @Expose()
  mealSelectionId: string;

  @ApiProperty({
    description: 'Unique identifier for the new menu item',
    example: ulid(),
  })
  @Expose()
  newMenuItemId: string;

  @ApiProperty({
    description: 'New quantity for the meal selection',
    example: 2,
  })
  @Expose()
  newQuantity: number | null;

  @ApiProperty({
    description: 'Status of the change request',
    example: 'pending',
  })
  @Expose()
  status: 'pending' | 'approved' | 'rejected';

  @ApiProperty({
    description:
      'Unique identifier for the user who approved the change request',
    example: ulid(),
  })
  @Expose()
  approvedBy: string | null;

  @ApiProperty({
    description: 'Date when the change request was approved',
    example: new Date(),
  })
  @Expose()
  approvedAt: Date | null;
}
