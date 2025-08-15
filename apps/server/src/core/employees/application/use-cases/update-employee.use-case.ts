import { Injectable } from '@nestjs/common';
import { Employee } from '../../domain/employee.entity';
import { IEmployeeRepository } from '../../domain/employee.repository.interface';

@Injectable()
export class UpdateEmployeeUseCase {
  constructor(private readonly repository: IEmployeeRepository) {}

  async execute(id: string, update: Partial<Employee>): Promise<Employee> {
    return this.repository.update(id, update as Employee);
  }
}
