import { Provider } from '@nestjs/common';
import { CreateIdentityUseCase } from 'src/core/identity/application/use-cases/create-identity.use-case';
import { CreateEmployeeUseCase } from '../application/use-cases/create-employee.use-case';
import { DeleteEmployeeUseCase } from '../application/use-cases/delete-employee.use-case';
import { FindAllEmployeesByBusinessUseCase } from '../application/use-cases/find-all-employees.use-case';
import { FindEmployeeByIdentityUseCase } from '../application/use-cases/find-employee-by-identity.user-case';
import { FindEmployeeUseCase } from '../application/use-cases/find-employee.use-case';
import { UpdateEmployeeUseCase } from '../application/use-cases/update-employee.use-case';
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
    useFactory: (
      employeesRepository: IEmployeeRepository,
      createIdentityUseCase: CreateIdentityUseCase,
    ) => new CreateEmployeeUseCase(employeesRepository, createIdentityUseCase),
    inject: [I_EMPLOYEES_REPOSITORY, CreateIdentityUseCase],
  },
  {
    provide: FindAllEmployeesByBusinessUseCase,
    useFactory: (employeesRepository: IEmployeeRepository) =>
      new FindAllEmployeesByBusinessUseCase(employeesRepository),
    inject: [I_EMPLOYEES_REPOSITORY],
  },
  {
    provide: FindEmployeeUseCase,
    useFactory: (employeesRepository: IEmployeeRepository) =>
      new FindEmployeeUseCase(employeesRepository),
    inject: [I_EMPLOYEES_REPOSITORY],
  },
  {
    provide: UpdateEmployeeUseCase,
    useFactory: (employeesRepository: IEmployeeRepository) =>
      new UpdateEmployeeUseCase(employeesRepository),
    inject: [I_EMPLOYEES_REPOSITORY],
  },
  {
    provide: DeleteEmployeeUseCase,
    useFactory: (employeesRepository: IEmployeeRepository) =>
      new DeleteEmployeeUseCase(employeesRepository),
    inject: [I_EMPLOYEES_REPOSITORY],
  },
  {
    provide: FindEmployeeByIdentityUseCase,
    useFactory: (employeesRepository: IEmployeeRepository) =>
      new FindEmployeeByIdentityUseCase(employeesRepository),
    inject: [I_EMPLOYEES_REPOSITORY],
  },
];
