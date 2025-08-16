import { Entity } from 'src/shared/domain/entity';

export class BusinessSupplier extends Entity {
  constructor(id: string, businessId: string, supplierId: string) {
    super();
    this.id = id;
    this.businessId = businessId;
    this.supplierId = supplierId;
  }

  readonly id: string;
  businessId: string;
  supplierId: string;
}
