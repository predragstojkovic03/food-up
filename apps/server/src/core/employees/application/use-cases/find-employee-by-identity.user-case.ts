import { IEmployeeRepository } from '../../domain/employee.repository.interface';

export class FindEmployeeByIdentityUseCase {
  constructor(private readonly employeeRepository: IEmployeeRepository) {}

  async execute(identityId: string) {
    return this.employeeRepository.findByCriteria({ identityId });
  }
}
