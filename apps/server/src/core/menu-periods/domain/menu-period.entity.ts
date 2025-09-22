import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { MenuPeriodCreatedEvent } from './events/menu-period-created.event';

export class MenuPeriod extends Entity {
  constructor(id: string, startDate: Date, endDate: Date, supplierId: string) {
    if (endDate <= startDate) {
      throw new InvalidInputDataException('End date must be after start date');
    }

    super();
    this.id = id;
    this.startDate = startDate;
    this.endDate = endDate;
    this.supplierId = supplierId;

    this.addDomainEvent(new MenuPeriodCreatedEvent(this.id));
  }

  readonly id: string;
  startDate: Date;
  endDate: Date;
  supplierId: string;
}
