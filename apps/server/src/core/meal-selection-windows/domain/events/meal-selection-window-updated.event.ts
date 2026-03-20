import { IEvent } from 'src/shared/domain/event.interface';

export interface MealSelectionWindowUpdatedPayload {
  mealSelectionWindowId: string;
  isLocked: boolean;
}

export class MealSelectionWindowUpdatedEvent implements IEvent {
  static readonly EVENT_NAME = 'mealSelectionWindow.updated';
  readonly name = MealSelectionWindowUpdatedEvent.EVENT_NAME;

  constructor(public readonly payload: MealSelectionWindowUpdatedPayload) {}
}
