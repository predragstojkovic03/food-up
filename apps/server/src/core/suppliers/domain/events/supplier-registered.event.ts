import { IEvent } from 'src/shared/domain/event.interface';

export class SupplierRegisteredEvent implements IEvent {
  name: string = 'supplier.registered';
  constructor(
    public readonly supplierId: string,
    public readonly email: string,
  ) {}
}
