import { MealType } from '@food-up/shared';
import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';

export class MyMealSelectionMealDto {
  @ApiProperty()
  @Expose()
  name: string;

  @ApiProperty({ enum: MealType })
  @Expose()
  type: MealType;
}

export class MyMealSelectionResponseDto {
  @ApiProperty()
  @Expose()
  id: string;

  @ApiProperty()
  @Expose()
  date: string;

  @ApiProperty()
  @Expose()
  mealSelectionWindowId: string;

  @ApiProperty({ nullable: true })
  @Expose()
  menuItemId: string | null;

  @ApiProperty({ nullable: true, required: false })
  @Expose()
  quantity?: number | null;

  @ApiProperty({ nullable: true, type: MyMealSelectionMealDto })
  @Type(() => MyMealSelectionMealDto)
  @Expose()
  meal: MyMealSelectionMealDto | null;
}
