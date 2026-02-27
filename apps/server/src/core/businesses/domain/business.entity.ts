import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class Business extends Entity {
  static create(
    name: string,
    contactEmail: string,
    contactPhone?: string | null,
  ): Business {
    return new Business(generateId(), name, contactEmail, contactPhone);
  }

  static reconstitute(
    id: string,
    name: string,
    contactEmail: string,
    contactPhone?: string | null,
    employeeIds: string[] = [],
    supplierIds: string[] = [],
    managedSupplierIds: string[] = [],
  ): Business {
    return new Business(
      id,
      name,
      contactEmail,
      contactPhone,
      employeeIds,
      supplierIds,
      managedSupplierIds,
    );
  }

  private constructor(
    id: string,
    name: string,
    contactEmail: string,
    contactPhone?: string | null,
    employeeIds: string[] = [],
    supplierIds: string[] = [],
    managedSupplierIds: string[] = [],
  ) {
    super();
    this.id = id;
    this.name = name;
    this.contactEmail = contactEmail;
    this.employeeIds = employeeIds;
    this.supplierIds = supplierIds;
    this.managedSupplierIds = managedSupplierIds;
    this.contactPhone = contactPhone;
  }

  readonly id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string | null;
  employeeIds: string[];
  supplierIds: string[];
  managedSupplierIds: string[];
}
