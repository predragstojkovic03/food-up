import { MealType } from '@food-up/shared';

export interface MenuItemOption {
  id: string;
  name: string;
  description: string;
  type: MealType;
  price?: number;
}

// What the user has decided for a single day
export interface DaySelection {
  date: string;
  skipped: boolean;
  // menuItemId per meal type — undefined means "not yet chosen"
  choices: Partial<Record<MealType, string>>;
  // existing server-side selection IDs for updates
  existingIds: Partial<Record<MealType, string>>;
}
