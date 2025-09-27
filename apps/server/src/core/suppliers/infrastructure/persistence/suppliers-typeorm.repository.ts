import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DeepPartial, Repository } from 'typeorm';
import { Supplier } from '../../domain/supplier.entity';
import { ISuppliersRepository } from '../../domain/suppliers.repository.interface';
import { SupplierTypeOrmMapper } from './supplier-typeorm.mapper';
import { Supplier as SupplierPersistence } from './supplier.typeorm-entity';

@Injectable()
export class SuppliersTypeOrmRepository
  extends TypeOrmRepository<Supplier>
  implements ISuppliersRepository
{
  constructor(
    @InjectRepository(SupplierPersistence)
    repository: Repository<Supplier>,
  ) {
    super(repository, new SupplierTypeOrmMapper());
  }

  public override async findOneByCriteria(
    criteria: Partial<Supplier>,
  ): Promise<Supplier | null> {
    const where = this.buildWhere(criteria);

    return await super.findOneByCriteria(where);
  }

  public override async findOneByCriteriaOrThrow(
    criteria: Partial<Supplier>,
  ): Promise<Supplier> {
    const where = this.buildWhere(criteria);
    console.log(where);

    return await super.findOneByCriteriaOrThrow(where);
  }

  private buildWhere(
    criteria: Partial<Supplier>,
  ): DeepPartial<SupplierPersistence> {
    const where: DeepPartial<SupplierPersistence> = { ...criteria };

    if (criteria.identityId) {
      where.identity = { id: criteria.identityId };

      // @ts-ignore
      delete where.identityId;
    }

    if (criteria.managingBusinessId) {
      where.managingBusiness = { id: criteria.managingBusinessId };

      // @ts-ignore
      delete where.managingBusinessId;
    }

    return where;
  }
}
