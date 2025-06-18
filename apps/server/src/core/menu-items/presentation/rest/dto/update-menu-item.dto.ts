export class UpdateMenuItemDto {
  name?: string;
  description?: string;
  price?: number | null;
  menuPeriodId?: string;
  day?: Date;
  mealType?: 'breakfast' | 'lunch' | 'dinner';
}
