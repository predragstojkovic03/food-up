import { Entity } from 'src/shared/domain/entity';

export class Employee extends Entity {
  constructor(
    id: string,
    name: string,
    email: string,
    isAdmin: boolean = false,
    businessId: string,
  ) {
    super();

    this.id = id;
    this.name = name;
    this.email = email;
    this.isAdmin = isAdmin;
    this.businessId = businessId;
  }

  readonly id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  businessId: string;
}
