import { IEvent } from 'src/shared/domain/event.interface';

export class MealSelectionWindowCreatedEvent implements IEvent {
  name: string = 'mealSelectionWindow.created';

  constructor(public readonly mealSelectionWindowId: string) {}
}
