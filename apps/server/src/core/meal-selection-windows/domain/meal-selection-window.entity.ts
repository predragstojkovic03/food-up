import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { MealSelectionWindowCreatedEvent } from './events/meal-selection-window-created.event';
import { MealSelectionWindowUpdatedEvent } from './events/meal-selection-window-updated.event';

export class MealSelectionWindow extends Entity {
  static create(
    startTime: Date,
    endTime: Date,
    targetDates: Set<string>,
    businessId: string,
    menuPeriodIds: string[],
  ): MealSelectionWindow {
    const window = new MealSelectionWindow(
      generateId(),
      startTime,
      endTime,
      targetDates,
      businessId,
      menuPeriodIds,
    );
    window.addDomainEvent(new MealSelectionWindowCreatedEvent(window.id));
    return window;
  }

  static reconstitute(
    id: string,
    startTime: Date,
    endTime: Date,
    targetDates: Set<string>,
    businessId: string,
    menuPeriodIds: string[],
  ): MealSelectionWindow {
    return new MealSelectionWindow(
      id,
      startTime,
      endTime,
      targetDates,
      businessId,
      menuPeriodIds,
    );
  }

  private constructor(
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

  public get isActive(): boolean {
    const now = new Date();
    return now >= this.startTime && now <= this.endTime;
  }

  readonly id: string;
  startTime: Date;
  endTime: Date;

  targetDates: Set<string>;
  businessId: string;
  menuPeriodIds: string[];

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
}
