import { CreateIdentityUseCase } from 'src/core/identity/application/use-cases/create-identity.use-case';
import { ulid } from 'ulid';
import { Employee } from '../../domain/employee.entity';
import { IEmployeeRepository } from '../../domain/employee.repository.interface';
import { CreateEmployeeDto } from '../dto/create-employee.dto';

export class CreateEmployeeUseCase {
  constructor(
    private readonly employeeRepository: IEmployeeRepository,
    private readonly createIdentityUseCase: CreateIdentityUseCase,
  ) {}

  async execute(employeeData: CreateEmployeeDto): Promise<Employee> {
    const { name, email, role, businessId, password } = employeeData;

    const identity = await this.createIdentityUseCase.execute({
      id: ulid(),
      email,
      password,
      type: 'employee',
      isActive: true,
    });

    const employee = new Employee(ulid(), name, role, businessId, identity.id);

    return await this.employeeRepository.insert(employee);
  }
}
