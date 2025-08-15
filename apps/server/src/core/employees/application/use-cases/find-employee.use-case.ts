import { Injectable } from '@nestjs/common';
import { Employee } from '../../domain/employee.entity';
import { IEmployeeRepository } from '../../domain/employee.repository.interface';

@Injectable()
export class FindEmployeeUseCase {
  constructor(private readonly repository: IEmployeeRepository) {}

  async execute(id: string): Promise<Employee | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
