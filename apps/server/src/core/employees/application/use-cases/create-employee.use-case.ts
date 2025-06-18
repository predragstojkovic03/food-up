import { ulid } from 'ulid';
import { Employee } from '../../domain/employee.entity';
import { IEmployeeRepository } from '../../domain/employee.repository.interface';
import { CreateEmployeeDto } from '../dto/create-employee.dto';

export class CreateEmployeeUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(employeeData: CreateEmployeeDto): Promise<Employee> {
    const { name, email, isAdmin, businessId } = employeeData;
    const employee = new Employee(ulid(), name, email, isAdmin, businessId);

    return await this.employeeRepository.insert(employee);
  }
}
