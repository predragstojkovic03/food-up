import { SupplierType } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { generateId } from 'src/shared/domain/generate-id';
import { ManagedSupplierCreatedEvent } from './events/managed-supplier-created.even';
import { SupplierEmailChangedEvent } from './events/supplier-email-changed.event';
import { SupplierInfoUpdatedEvent } from './events/supplier-info-updated.event';
import { SupplierNameChangedEvent } from './events/supplier-name-changed.event';
import { SupplierRegisteredEvent } from './events/supplier-registered.event';

export class Supplier extends Entity {
  static register(
    name: string,
    email: string | null,
    identityId: string,
  ): Supplier {
    const supplier = new Supplier(
      generateId(),
      name,
      SupplierType.Standalone,
      email,
      [],
      undefined,
      identityId,
    );
    supplier.addDomainEvent(
      new SupplierRegisteredEvent(supplier.id, identityId),
    );
    return supplier;
  }

  static createManaged(
    name: string,
    email: string | null,
    businessIds: string[],
    managingBusinessId: string,
  ): Supplier {
    const supplier = new Supplier(
      generateId(),
      name,
      SupplierType.Managed,
      email,
      businessIds,
      managingBusinessId,
    );
    supplier.addDomainEvent(
      new ManagedSupplierCreatedEvent(supplier.id, managingBusinessId),
    );
    return supplier;
  }

  static reconstitute(
    id: string,
    name: string,
    type: SupplierType,
    email: string | null,
    businessIds: string[] = [],
    managingBusinessId?: string,
    identityId?: string,
  ): Supplier {
    return new Supplier(
      id,
      name,
      type,
      email,
      businessIds,
      managingBusinessId,
      identityId,
    );
  }

  private constructor(
    id: string,
    name: string,
    type: SupplierType,
    email: string | null,
    businessIds: string[] = [],
    managingBusinessId?: string,
    identityId?: string,
  ) {
    super();

    if (type === SupplierType.Standalone && !identityId) {
      throw new InvalidInputDataException(
        'Identity ID is required for standalone suppliers',
      );
    }

    if (type === SupplierType.Managed && !managingBusinessId) {
      throw new InvalidInputDataException(
        'Managing Business ID is required for managed suppliers',
      );
    }

    this._id = id;
    this._name = name;
    this._type = type;
    this._email = email;
    this._businessIds = businessIds;
    this._managingBusinessId = managingBusinessId;
    this._identityId = identityId;
  }

  private readonly _id: string;
  private _name: string;
  private readonly _type: SupplierType;
  private _email: string | null;
  private readonly _businessIds: string[];
  private readonly _managingBusinessId?: string;
  private readonly _identityId?: string;

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  set name(value: string) {
    this._name = value;
    this.addDomainEvent(new SupplierNameChangedEvent(this.id, value));
  }

  get type(): SupplierType {
    return this._type;
  }

  isStandalone(): this is this & {
    identityId: string;
    managingBusinessId: undefined;
  } {
    return this._type === SupplierType.Standalone;
  }

  isManaged(): this is this & {
    identityId: undefined;
    managingBusinessId: string;
  } {
    return this._type === SupplierType.Managed;
  }

  get email(): string | null {
    return this._email;
  }

  set email(value: string | null) {
    this._email = value;
    this.addDomainEvent(new SupplierEmailChangedEvent(this.id, value));
  }

  get businessIds(): string[] {
    return this._businessIds;
  }

  get managingBusinessId(): string | undefined {
    return this._managingBusinessId;
  }

  get identityId(): string | undefined {
    return this._identityId;
  }

  updateInfo(name?: string, email?: string) {
    if (name !== undefined) {
      this.name = name;
    }
    if (email !== undefined) {
      this.email = email;
    }
    this.addDomainEvent(new SupplierInfoUpdatedEvent(this.id));
  }
}
