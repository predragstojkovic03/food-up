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
    this._id = id;
    this._name = name;
    this._role = role;
    this._businessId = businessId;
    this._identityId = identityId;
  }

  private readonly _id: string;
  private readonly _name: string;
  private readonly _role: EmployeeRole;
  private readonly _businessId: Business['id'];
  private readonly _identityId: Identity['id'];

  get id(): string {
    return this._id;
  }

  get name(): string {
    return this._name;
  }

  get role(): EmployeeRole {
    return this._role;
  }

  get businessId(): Business['id'] {
    return this._businessId;
  }

  get identityId(): Identity['id'] {
    return this._identityId;
  }
}
