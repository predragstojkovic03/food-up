import { Entity } from 'src/shared/domain/entity';
import { SupplierType } from './supplier-type.enum';

export class Supplier extends Entity {
  constructor(
    id: string,
    name: string,
    type: SupplierType,
    contactInfo: string,
    businessIds: string[] = [],
    managingBusinessId?: string, // Optional field for managing business ID
  ) {
    super();
    this.id = id;
    this.name = name;
    this.type = type;
    this.contactInfo = contactInfo;
    this.businessIds = businessIds;
    this.managingBusinessId = managingBusinessId;
  }

  readonly id: string;
  name: string;
  type: SupplierType;
  contactInfo: string;
  businessIds: string[];
  managingBusinessId?: string;
}
