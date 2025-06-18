import { Entity } from 'src/shared/domain/entity';

export class MenuItem extends Entity {
  constructor(
    id: string,
    name: string,
    description: string,
    price: number | null,
    menuPeriodId: string,
    day: Date,
    mealType: 'breakfast' | 'lunch' | 'dinner',
  ) {
    super();
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.menuPeriodId = menuPeriodId;
    this.day = day;
    this.mealType = mealType;
  }

  readonly id: string;
  name: string;
  description: string;
  price: number | null;
  menuPeriodId: string;
  day: Date;
  mealType: 'breakfast' | 'lunch' | 'dinner';
}
