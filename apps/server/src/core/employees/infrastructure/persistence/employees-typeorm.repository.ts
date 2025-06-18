import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { Employee } from '../../domain/employee.entity';
import { EmployeeTypeOrmMapper } from './employee-typeorm.mapper';

export class EmployeesTypeOrmRepository extends TypeOrmRepository<Employee> {
  constructor(@InjectRepository(Employee) repository: Repository<Employee>) {
    super(repository, new EmployeeTypeOrmMapper());
  }
}
