import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { MenuPeriodCreatedEvent } from './events/menu-period-created.event';
import { MenuPeriodDetailsUpdatedEvent } from './events/menu-period-details-updated.event';

export class MenuPeriod extends Entity {
  constructor(id: string, startDate: Date, endDate: Date, supplierId: string) {
    if (endDate <= startDate) {
      throw new InvalidInputDataException('End date must be after start date');
    }

    super();
    this._id = id;
    this._startDate = startDate;
    this._endDate = endDate;
    this._supplierId = supplierId;

    this.addDomainEvent(new MenuPeriodCreatedEvent(this._id));
  }

  private readonly _id: string;
  private _startDate: Date;
  private _endDate: Date;
  private readonly _supplierId: string;

  get id(): string {
    return this._id;
  }

  get startDate(): Date {
    return this._startDate;
  }

  get endDate(): Date {
    return this._endDate;
  }

  get supplierId(): string {
    return this._supplierId;
  }

  updateDetails(startDate?: Date, endDate?: Date): void {
    if (startDate) {
      this._startDate = startDate;
    }

    if (endDate) {
      this._endDate = endDate;
    }

    if (this._endDate <= this._startDate) {
      throw new InvalidInputDataException('End date must be after start date');
    }

    this.addDomainEvent(new MenuPeriodDetailsUpdatedEvent(this._id));
  }
}
