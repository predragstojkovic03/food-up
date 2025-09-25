import { IEvent } from 'src/shared/domain/event.interface';

export class MealSelectionMenuItemChangedEvent implements IEvent {
  name: string = 'mealSelection.menuItemChanged';
  constructor(
    public readonly mealSelectionId: string,
    public readonly menuItemId: string,
  ) {}
}
