import { Language } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';

export class BusinessSupplier extends Entity {
  constructor(
    id: string,
    businessId: string,
    supplierId: string,
    language: Language = Language.En,
  ) {
    super();
    this._id = id;
    this._businessId = businessId;
    this._supplierId = supplierId;
    this._language = language;
  }

  private readonly _id: string;
  private readonly _businessId: string;
  private readonly _supplierId: string;
  private _language: Language;

  get id(): string {
    return this._id;
  }

  get businessId(): string {
    return this._businessId;
  }

  get supplierId(): string {
    return this._supplierId;
  }

  get language(): Language {
    return this._language;
  }

  set language(value: Language) {
    this._language = value;
  }
}
