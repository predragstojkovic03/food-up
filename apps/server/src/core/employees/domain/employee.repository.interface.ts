import { IRepository } from 'src/shared/domain/repository.interface';
import { Employee } from './employee.entity';

export const I_EMPLOYEES_REPOSITORY = Symbol('IEmployeesRepository');

export interface IEmployeeRepository extends IRepository<Employee> {}
