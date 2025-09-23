import { Entity } from 'src/shared/domain/entity';

export class Business extends Entity {
  constructor(
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
