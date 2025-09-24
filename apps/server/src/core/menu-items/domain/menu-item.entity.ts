import { Entity } from 'src/shared/domain/entity';

export class MenuItem extends Entity {
  constructor(
    id: string,
    price: number | null,
    menuPeriodId: string,
    day: string,
    mealId: string,
  ) {
    super();
    this.id = id;
    this.price = price;
    this.menuPeriodId = menuPeriodId;
    this.day = day;
    this.mealId = mealId;
  }

  readonly id: string;
  price: number | null;
  menuPeriodId: string;
  day: string;
  mealId: string;
}
