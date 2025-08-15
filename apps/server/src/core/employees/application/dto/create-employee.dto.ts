import { Role } from 'src/shared/domain/role.enum';

export class CreateEmployeeDto {
  name: string;
  email: string;
  role: Role;
  businessId: string;
  password: string;
}
