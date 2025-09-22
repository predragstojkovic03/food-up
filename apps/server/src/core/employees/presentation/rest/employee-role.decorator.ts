import { SetMetadata } from '@nestjs/common';
import { EmployeeRole as EmployeeRoleEnum } from 'src/shared/domain/role.enum';

export const EMPLOYEE_ROLE_KEY = 'employeeRole';
export const RequiredEmployeeRole = (...roles: EmployeeRoleEnum[]) =>
  SetMetadata(EMPLOYEE_ROLE_KEY, roles);
