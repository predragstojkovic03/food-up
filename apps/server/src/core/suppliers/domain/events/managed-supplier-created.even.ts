import { IEvent } from 'src/shared/domain/event.interface';

export class ManagedSupplierCreatedEvent implements IEvent {
  name: string = 'supplier.createdManaged';
  constructor(
    public readonly supplierId: string,
    public readonly managingBusinessId: string,
  ) {}
}
