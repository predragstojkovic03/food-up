import { IEvent } from 'src/shared/domain/event.interface';

export class SupplierContactInfoChangedEvent implements IEvent {
  name: string = 'supplier.contactInfoChanged';
  constructor(
    public readonly supplierId: string,
    public readonly contactInfo: string,
  ) {}
}
