import { IEvent } from 'src/shared/domain/event.interface';

export class MealSelectionCreatedEvent implements IEvent {
  name: string = 'MealSelectionWindowCreatedEvent';
  constructor(public readonly mealSelectionId: string) {}
}
