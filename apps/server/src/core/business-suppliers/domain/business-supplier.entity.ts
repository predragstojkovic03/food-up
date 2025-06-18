import { Entity } from 'src/shared/domain/entity';

export class BusinessSupplier extends Entity {
  constructor(
    id: string,
    businessId: string,
    supplierId: string,
    isManaged: boolean,
  ) {
    super();
    this.id = id;
    this.businessId = businessId;
    this.supplierId = supplierId;
    this.isManaged = isManaged;
  }

  readonly id: string;
  businessId: string;
  supplierId: string;
  isManaged: boolean;
}
