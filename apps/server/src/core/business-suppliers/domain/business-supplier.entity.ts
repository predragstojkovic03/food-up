import { Entity } from 'src/shared/domain/entity';

export class BusinessSupplier extends Entity {
  constructor(id: string, businessId: string, supplierId: string) {
    super();
    this._id = id;
    this._businessId = businessId;
    this._supplierId = supplierId;
  }

  private readonly _id: string;
  private readonly _businessId: string;
  private readonly _supplierId: string;

  get id(): string {
    return this._id;
  }

  get businessId(): string {
    return this._businessId;
  }

  get supplierId(): string {
    return this._supplierId;
  }
}
