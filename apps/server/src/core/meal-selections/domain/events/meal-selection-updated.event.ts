export class MealSelectionUpdatedEvent {
  name: string = 'MealSelectionUpdatedEvent';
  constructor(public readonly mealSelectionId: string) {}
}
