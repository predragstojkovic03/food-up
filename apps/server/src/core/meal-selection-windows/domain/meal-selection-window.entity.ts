import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { MealSelectionWindowCreatedEvent } from './events/meal-selection-window-created.event';
import { MealSelectionWindowUpdatedEvent } from './events/meal-selection-window-updated.event';

export class MealSelectionWindow extends Entity {
  /**
   *
   * @param id
   * @param startTime
   * @param endTime
   * @param businessId
   * @param menuPeriodIds
   * @throws {InvalidInputDataException} if menuPeriodIds is empty
   */
  constructor(
    id: string,
    startTime: Date,
    endTime: Date,
    targetDates: Set<string>,
    businessId: string,
    menuPeriodIds: string[],
  ) {
    super();
    this.verifyMealSelectionInputs(menuPeriodIds, startTime, endTime);

    this.id = id;
    this.startTime = startTime;
    this.endTime = endTime;
    this.businessId = businessId;
    this.menuPeriodIds = menuPeriodIds;
    this.targetDates = targetDates;

    this.addDomainEvent(new MealSelectionWindowCreatedEvent(this.id));
  }

  private verifyMealSelectionInputs(
    menuPeriodIds: string[],
    startTime: Date,
    endTime: Date,
  ) {
    if (menuPeriodIds.length === 0) {
      throw new InvalidInputDataException(
        'MealSelectionWindow must have at least one menu period ID.',
      );
    }

    if (startTime >= endTime) {
      throw new InvalidInputDataException(
        'MealSelectionWindow startTime must be before endTime.',
      );
    }
  }

  isDateWithinWindow(date: Date): boolean {
    return date >= this.startTime && date <= this.endTime;
  }

  update(
    startTime?: Date,
    endTime?: Date,
    businessId?: string,
    menuPeriodIds?: string[],
    targetDates?: Set<string>,
  ): this {
    this.verifyMealSelectionInputs(
      menuPeriodIds ?? this.menuPeriodIds,
      startTime ?? this.startTime,
      endTime ?? this.endTime,
    );

    this.startTime = startTime ?? this.startTime;
    this.endTime = endTime ?? this.endTime;
    this.businessId = businessId ?? this.businessId;
    this.menuPeriodIds = menuPeriodIds ?? this.menuPeriodIds;
    this.targetDates = targetDates ?? this.targetDates;

    this.addDomainEvent(new MealSelectionWindowUpdatedEvent(this.id));
    return this;
  }

  readonly id: string;
  startTime: Date;
  endTime: Date;

  targetDates: Set<string>;
  businessId: string;
  menuPeriodIds: string[];
}
