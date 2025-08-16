import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';

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
    businessId: string,
    menuPeriodIds: string[],
  ) {
    super();
    if (menuPeriodIds.length === 0) {
      throw new InvalidInputDataException(
        'MealSelectionWindow must have at least one menu period ID.',
      );
    }

    this.id = id;
    this.startTime = startTime;
    this.endTime = endTime;
    this.businessId = businessId;
    this.menuPeriodIds = menuPeriodIds;
  }

  readonly id: string;
  startTime: Date;
  endTime: Date;
  businessId: string;
  menuPeriodIds: string[];
}
