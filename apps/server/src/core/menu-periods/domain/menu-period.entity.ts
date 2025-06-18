import { Entity } from 'src/shared/domain/entity';

export class MenuPeriod extends Entity {
  constructor(id: string, startDate: Date, endDate: Date, supplierId: string) {
    super();
    this.id = id;
    this.startDate = startDate;
    this.endDate = endDate;
    this.supplierId = supplierId;
  }

  readonly id: string;
  startDate: Date;
  endDate: Date;
  supplierId: string;
}
