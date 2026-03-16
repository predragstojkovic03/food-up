import { SetMetadata } from '@nestjs/common';
import { EmployeeRole as EmployeeRoleEnum } from '@food-up/shared';

export const EMPLOYEE_ROLE_KEY = 'employeeRole';
export const RequiredEmployeeRole = (...roles: EmployeeRoleEnum[]) =>
  SetMetadata(EMPLOYEE_ROLE_KEY, roles);
