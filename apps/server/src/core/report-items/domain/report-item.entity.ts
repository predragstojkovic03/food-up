import { Entity } from 'src/shared/domain/entity';

export class ReportItem extends Entity {
  constructor(
    id: string,
    reportId: string,
    menuItemId: string,
    date: Date,
    quantity: number,
  ) {
    super();
    this.id = id;
    this.reportId = reportId;
    this.menuItemId = menuItemId;
    this.date = date;
    this.quantity = quantity;
  }

  readonly id: string;
  reportId: string;
  menuItemId: string;
  date: Date;
  quantity: number;
}
