import { IEmployeeRepository } from '../../domain/employee.repository.interface';

export class FindAllEmployeesByBusinessUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(businessId: string) {
    return this.employeeRepository.findByCriteria({ businessId });
  }
}
