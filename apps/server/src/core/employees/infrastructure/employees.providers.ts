import { Provider } from '@nestjs/common';
import { CreateEmployeeUseCase } from '../application/use-cases/create-employee.use-case';
import { FindAllEmployeesByBusinessUseCase } from '../application/use-cases/find-all-employees.use-case';
import {
  I_EMPLOYEES_REPOSITORY,
  IEmployeeRepository,
} from '../domain/employee.repository.interface';
import { EmployeesTypeOrmRepository } from './persistence/employees-typeorm.repository';

export const EmployeesRepositoryProvider: Provider = {
  provide: I_EMPLOYEES_REPOSITORY,
  useClass: EmployeesTypeOrmRepository,
};

export const EmployeesUseCaseProviders: Provider[] = [
  {
    provide: CreateEmployeeUseCase,
    useFactory: (employeesRepository: IEmployeeRepository) =>
      new CreateEmployeeUseCase(employeesRepository),
    inject: [I_EMPLOYEES_REPOSITORY],
  },
  {
    provide: FindAllEmployeesByBusinessUseCase,
    useFactory: (employeesRepository: IEmployeeRepository) =>
      new FindAllEmployeesByBusinessUseCase(employeesRepository),
    inject: [I_EMPLOYEES_REPOSITORY],
  },
];
