import { IdentityType } from '../../domain/identity.entity';

export class CreateIdentityDto {
  email: string;
  password: string;
  type: IdentityType;
  isActive?: boolean;
}
