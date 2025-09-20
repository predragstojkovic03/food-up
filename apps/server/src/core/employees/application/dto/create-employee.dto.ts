import { EmployeeRole } from 'src/shared/domain/role.enum';

export class CreateEmployeeDto {
  name: string;
  email: string;
  role: EmployeeRole;
  businessId: string;
  password: string;
}
