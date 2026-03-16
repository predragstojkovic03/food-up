import { IdentityType } from '@food-up/shared';

export class CreateIdentityDto {
  email: string;
  password: string;
  type: IdentityType;
  isActive?: boolean;
}
