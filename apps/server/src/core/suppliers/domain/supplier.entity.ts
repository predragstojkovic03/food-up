import { Entity } from 'src/shared/domain/entity';

export class Supplier extends Entity {
  constructor(
    id: string,
    name: string,
    type: 'registered' | 'external',
    contactInfo: string,
    businessIds: string[] = [],
  ) {
    super();
    this.id = id;
    this.name = name;
    this.type = type;
    this.contactInfo = contactInfo;
    this.businessIds = businessIds;
  }

  readonly id: string;
  name: string;
  type: 'registered' | 'external';
  contactInfo: string;
  businessIds: string[];
}
