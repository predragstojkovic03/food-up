import { Injectable } from '@nestjs/common';
import { IEmployeeRepository } from '../../domain/employee.repository.interface';

@Injectable()
export class DeleteEmployeeUseCase {
  constructor(private readonly repository: IEmployeeRepository) {}

  async execute(id: string): Promise<void> {
    return this.repository.delete(id);
  }
}
