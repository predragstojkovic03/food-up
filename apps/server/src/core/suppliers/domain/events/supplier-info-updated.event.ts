import { IEvent } from 'src/shared/domain/event.interface';

export class SupplierInfoUpdatedEvent implements IEvent {
  name: 'supplier.infoUpdated';
  constructor(public readonly supplierId: string) {}
}
