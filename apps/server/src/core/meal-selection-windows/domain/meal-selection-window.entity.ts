import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { generateId } from 'src/shared/domain/generate-id';
import { MealSelectionWindowCreatedEvent } from './events/meal-selection-window-created.event';
import { MealSelectionWindowUpdatedEvent } from './events/meal-selection-window-updated.event';

export class MealSelectionWindow extends Entity {
  static create(
    startTime: Date,
    endTime: Date,
    targetDates: Set<string>,
    businessId: string,
    menuPeriodIds: string[],
    notifyOnDeadline: boolean = false,
  ): MealSelectionWindow {
    const window = new MealSelectionWindow(
      generateId(),
      startTime,
      endTime,
      targetDates,
      businessId,
      menuPeriodIds,
      true, // New windows are locked by default until explicitly unlocked
      notifyOnDeadline,
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
    isLocked: boolean,
    notifyOnDeadline: boolean = false,
  ): MealSelectionWindow {
    return new MealSelectionWindow(
      id,
      startTime,
      endTime,
      targetDates,
      businessId,
      menuPeriodIds,
      isLocked,
      notifyOnDeadline,
    );
  }

  private constructor(
    id: string,
    startTime: Date,
    endTime: Date,
    targetDates: Set<string>,
    businessId: string,
    menuPeriodIds: string[],
    isLocked: boolean,
    notifyOnDeadline: boolean = false,
  ) {
    super();
    MealSelectionWindow.verifyInputs(menuPeriodIds, startTime, endTime);
    this.id = id;
    this.startTime = startTime;
    this.endTime = endTime;
    this.businessId = businessId;
    this.menuPeriodIds = menuPeriodIds;
    this.targetDates = targetDates;
    this.isLocked = isLocked;
    this.notifyOnDeadline = notifyOnDeadline;
  }

  update(
    startTime?: Date,
    endTime?: Date,
    businessId?: string,
    menuPeriodIds?: string[],
    targetDates?: Set<string>,
    isLocked?: boolean,
    notifyOnDeadline?: boolean,
  ): this {
    MealSelectionWindow.verifyInputs(
      menuPeriodIds ?? this.menuPeriodIds,
      startTime ?? this.startTime,
      endTime ?? this.endTime,
    );

    this.startTime = startTime ?? this.startTime;
    this.endTime = endTime ?? this.endTime;
    this.businessId = businessId ?? this.businessId;
    this.menuPeriodIds = menuPeriodIds ?? this.menuPeriodIds;
    this.targetDates = targetDates ?? this.targetDates;
    this.isLocked = isLocked ?? this.isLocked;
    this.notifyOnDeadline = notifyOnDeadline ?? this.notifyOnDeadline;

    this.addDomainEvent(
      new MealSelectionWindowUpdatedEvent({
        mealSelectionWindowId: this.id,
        endTime: this.endTime,
        isLocked: this.isLocked,
        notifyOnDeadline: this.notifyOnDeadline,
      }),
    );
    return this;
  }

  public get isActive(): boolean {
    return !this.isPastDeadline && !this.isLocked;
  }

  public get isPastDeadline(): boolean {
    const now = new Date();
    return now > this.endTime;
  }

  readonly id: string;
  startTime: Date;
  endTime: Date;

  targetDates: Set<string>;
  businessId: string;
  menuPeriodIds: string[];
  isLocked: boolean;
  notifyOnDeadline: boolean;

  private static verifyInputs(
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
