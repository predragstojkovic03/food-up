import { EmployeeRole } from '@food-up/shared';

export class UpdateEmployeeDto {
  name?: string;
  role?: EmployeeRole;
  isActive?: boolean;
}
