import { Role } from 'src/shared/domain/role.enum';

export type CreateEmployeeDto = {
  name: string;
  email: string;
  role: Role;
  businessId: string;
  password: string;
};
