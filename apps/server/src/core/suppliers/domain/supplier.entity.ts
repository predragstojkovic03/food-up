import { Entity } from 'src/shared/domain/entity';

export class Supplier extends Entity {
  constructor(
    id: string,
    name: string,
    type: 'registered' | 'external',
    contactInfo: string,
    businessId?: string | null,
    userId?: string | null,
  ) {
    super();
    this.id = id;
    this.name = name;
    this.type = type;
    this.contactInfo = contactInfo;
    this.businessId = businessId ?? null;
    this.userId = userId ?? null;
  }

  readonly id: string;
  name: string;
  type: 'registered' | 'external';
  contactInfo: string;
  businessId: string | null;
  userId: string | null;
}
