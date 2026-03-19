import { ChangeRequestStatus, MealType } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class MealSummaryResponseDto {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ enum: MealType })
  @Expose()
  type: MealType;
}

export class RichChangeRequestResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty({ enum: ChangeRequestStatus })
  @Expose()
  status: ChangeRequestStatus;

  @ApiProperty()
  @Expose()
  employeeId: string;

  @ApiProperty()
  @Expose()
  employeeName: string;

  @ApiProperty()
  @Expose()
  mealSelectionWindowId: string;

  @ApiProperty({ nullable: true })
  @Expose()
  mealSelectionId: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  date: string | null;

  @ApiProperty({ nullable: true, type: MealSummaryResponseDto })
  @Type(() => MealSummaryResponseDto)
  @Expose()
  currentMeal: MealSummaryResponseDto | null;

  @ApiProperty({ nullable: true, type: MealSummaryResponseDto })
  @Type(() => MealSummaryResponseDto)
  @Expose()
  requestedMeal: MealSummaryResponseDto | null;

  @ApiProperty()
  @Expose()
  clearSelection: boolean;

  @ApiProperty({ nullable: true })
  @Expose()
  newMenuItemId: string | null;

  @ApiProperty({ nullable: true })
  @Expose()
  newQuantity: number | null;
}
