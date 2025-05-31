import { Entity } from 'src/shared/domain/entity';

export class Business extends Entity {
  constructor(id: string, name: string, contactEmail: string) {
    super();
    this.id = id;
    this.name = name;
    this.contactEmail = contactEmail;
  }

  id: string;
  name: string;
  contactEmail: string;
}
