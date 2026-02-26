import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { Employee } from '../../domain/employee.entity';
import { EmployeeTypeOrmMapper } from './employee-typeorm.mapper';
import { Employee as EmployeePersistence } from './employee.typeorm-entity';

@Injectable()
export class EmployeesTypeOrmRepository extends TypeOrmRepository<Employee> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, EmployeePersistence, new EmployeeTypeOrmMapper(), transactionContext);
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
