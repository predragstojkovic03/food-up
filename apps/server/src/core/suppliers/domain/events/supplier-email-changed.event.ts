import { IEvent } from 'src/shared/domain/event.interface';

export class SupplierEmailChangedEvent implements IEvent {
  name: string = 'supplier.emailChanged';
  constructor(
    public readonly supplierId: string,
    public readonly email: string | null,
  ) {}
}
