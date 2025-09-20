import { Business } from 'src/core/businesses/domain/business.entity';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { Entity } from 'src/shared/domain/entity';
import { EmployeeRole } from 'src/shared/domain/role.enum';

export class Employee extends Entity {
  constructor(
    id: string,
    name: string,
    role: EmployeeRole = EmployeeRole.Basic,
    businessId: string,
    identityId: Identity['id'],
  ) {
    super();

    this.id = id;
    this.name = name;
    this.role = role;
    this.businessId = businessId;
    this.identityId = identityId;
  }

  readonly id: string;
  name: string;
  role: EmployeeRole;
  businessId: Business['id'];
  identityId: Identity['id'];
}
