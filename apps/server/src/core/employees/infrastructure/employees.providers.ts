import { Provider } from '@nestjs/common';
import { I_EMPLOYEES_REPOSITORY } from '../domain/employee.repository.interface';
import { EmployeesTypeOrmRepository } from './persistence/employees-typeorm.repository';

export const EmployeesRepositoryProvider: Provider = {
  provide: I_EMPLOYEES_REPOSITORY,
  useClass: EmployeesTypeOrmRepository,
  // UseCase providers removed. Only repository provider remains.
};
