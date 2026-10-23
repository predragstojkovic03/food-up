import { Language } from '@food-up/shared';
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
    language: Language = Language.En,
    reportIncludeEmployeesWithoutSelection = false,
  ): Business {
    const b = new Business(
      id,
      name,
      contactEmail,
      contactPhone,
      employeeIds,
      supplierIds,
      managedSupplierIds,
    );
    b.language = language;
    b.reportIncludeEmployeesWithoutSelection = reportIncludeEmployeesWithoutSelection;
    return b;
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
    this.language = Language.En;
    this.reportIncludeEmployeesWithoutSelection = false;
  }

  readonly id: string;
  name: string;
  contactEmail: string;
  contactPhone?: string | null;
  employeeIds: string[];
  supplierIds: string[];
  managedSupplierIds: string[];
  language: Language;
  reportIncludeEmployeesWithoutSelection: boolean;
}
