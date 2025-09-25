import { IEvent } from 'src/shared/domain/event.interface';

export class MealSelectionQuantityChangedEvent implements IEvent {
  name: string = 'mealSelection.quantityChanged';
  constructor(
    public readonly mealSelectionId: string,
    public readonly quantity: number | null,
  ) {}
}
