import { IEvent } from 'src/shared/domain/event.interface';

export class SupplierNameChangedEvent implements IEvent {
  name: string = 'supplier.nameChanged';
  constructor(
    public readonly supplierId: string,
    public readonly supplierName: string,
  ) {}
}
