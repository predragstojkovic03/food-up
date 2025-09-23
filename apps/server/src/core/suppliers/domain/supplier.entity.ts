import { Entity } from 'src/shared/domain/entity';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
import { ManagedSupplierCreatedEvent } from './events/managed-supplier-created.even';
import { SupplierRegisteredEvent } from './events/supplier-registered.event';
import { SupplierType } from './supplier-type.enum';

export class Supplier extends Entity {
  constructor(
    id: string,
    name: string,
    type: SupplierType,
    contactInfo: string,
    businessIds: string[] = [],
    managingBusinessId?: string, // Optional field for managing business ID
    identityId?: string, // Optional field for associated identity ID
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

    this.id = id;
    this.name = name;
    this.type = type;
    this.contactInfo = contactInfo;
    this.businessIds = businessIds;
    this.managingBusinessId = managingBusinessId;
    this.identityId = identityId;

    this.addDomainEvent(
      type === SupplierType.Managed
        ? new ManagedSupplierCreatedEvent(id, managingBusinessId as string)
        : new SupplierRegisteredEvent(id, identityId as string),
    );
  }

  readonly id: string;
  name: string;
  type: SupplierType;
  contactInfo: string;
  businessIds: string[];
  managingBusinessId?: string;
  identityId?: string;
}
