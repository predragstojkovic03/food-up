import { Business } from 'src/core/businesses/domain/business.entity';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { Entity } from 'src/shared/domain/entity';
import { EmployeeRole } from 'src/shared/domain/role.enum';
import { ulid } from 'ulid';
import { EmployeeCreatedEvent } from './events/employee-created.event';

export class Employee extends Entity {
  static create(
    name: string,
    role: EmployeeRole = EmployeeRole.Basic,
    businessId: string,
    identityId: Identity['id'],
  ): Employee {
    const employee = new Employee(ulid(), name, role, businessId, identityId);

    employee.addDomainEvent(
      new EmployeeCreatedEvent(
        employee.id,
        employee.name,
        employee.role,
        employee.businessId,
      ),
    );

    return employee;
  }

  static reconstitute(
    id: string,
    name: string,
    role: EmployeeRole = EmployeeRole.Basic,
    businessId: string,
    identityId: Identity['id'],
  ): Employee {
    return new Employee(id, name, role, businessId, identityId);
  }

  private constructor(
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
  private _name: string;
  private _role: EmployeeRole;
  private _businessId: Business['id'];
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

  set name(name: string) {
    this._name = name;
  }

  set role(role: EmployeeRole) {
    this._role = role;
  }

  set businessId(businessId: Business['id']) {
    this._businessId = businessId;
  }
}
