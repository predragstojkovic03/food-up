import { Entity } from 'src/shared/domain/entity';

export class MealSelectionWindow extends Entity {
  constructor(
    id: string,
    startTime: Date,
    endTime: Date,
    businessId: string,
    menuPeriodId?: string | null,
  ) {
    super();
    this.id = id;
    this.startTime = startTime;
    this.endTime = endTime;
    this.businessId = businessId;
    this.menuPeriodId = menuPeriodId ?? null;
  }

  readonly id: string;
  startTime: Date;
  endTime: Date;
  businessId: string;
  menuPeriodId: string | null;
}
