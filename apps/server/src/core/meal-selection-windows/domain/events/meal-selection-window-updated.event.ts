import { IEvent } from 'src/shared/domain/event.interface';

export class MealSelectionWindowUpdatedEvent implements IEvent {
  name: string = 'mealSelectionWindow.updated';

  constructor(public readonly mealSelectionWindowId: string) {}
}
