import { Business } from 'src/core/businesses/domain/business.entity';
import { Entity } from 'src/shared/domain/entity';

export class Employee extends Entity {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  business: Business;
}
