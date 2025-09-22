import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { Employee } from '../../domain/employee.entity';
import { EmployeeTypeOrmMapper } from './employee-typeorm.mapper';
import { Employee as EmployeePersistence } from './employee.typeorm-entity';

export class EmployeesTypeOrmRepository extends TypeOrmRepository<Employee> {
  constructor(
    @InjectRepository(EmployeePersistence)
    repository: Repository<EmployeePersistence>,
  ) {
    super(repository, new EmployeeTypeOrmMapper());
  }

  override async findByCriteria(
    criteria: Partial<Employee>,
  ): Promise<Employee[]> {
    const where = this.getWhereClause(criteria);

    return (await this._repository.find({ where })).map((entity) =>
      this._mapper.toDomain(entity as EmployeePersistence),
    );
  }

  override async findOneByCriteria(
    criteria: Partial<Employee>,
  ): Promise<Employee | null> {
    const where: any = this.getWhereClause(criteria);

    return await this._repository
      .findOne({
        where,
      })
      .then((entity) =>
        entity ? this._mapper.toDomain(entity as EmployeePersistence) : null,
      );
  }

  private getWhereClause(criteria: Partial<Employee>) {
    const where: any = { ...criteria };

    if (criteria.businessId) {
      where.business = { id: criteria.businessId };
      delete where.businessId;
    }

    if (criteria.identityId) {
      where.identity = { id: criteria.identityId };
      delete where.identityId;
    }

    return where;
  }
}
