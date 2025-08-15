import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { Employee } from '../../domain/employee.entity';
import { EmployeeTypeOrmMapper } from './employee-typeorm.mapper';

export class EmployeesTypeOrmRepository extends TypeOrmRepository<Employee> {
  constructor(@InjectRepository(Employee) repository: Repository<Employee>) {
    super(repository, new EmployeeTypeOrmMapper());
  }

  override async findByCriteria(
    criteria: Partial<Employee>,
  ): Promise<Employee[]> {
    const where = { ...criteria } as any;
    if (criteria.businessId) {
      where.business = { id: criteria.businessId };
      delete where.businessId;
    }

    return await this._repository.find({ where });
  }

  override async findOneByCriteria(
    criteria: Partial<Employee>,
  ): Promise<Employee | null> {
    const where: any = { ...criteria };
    if (criteria.businessId) {
      where.business = { id: criteria.businessId };
      delete where.businessId;
    }

    return await this._repository.findOne({
      where,
    });
  }
}
