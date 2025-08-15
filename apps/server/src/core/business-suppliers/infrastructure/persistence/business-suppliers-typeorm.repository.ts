import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { BusinessSupplier } from '../../domain/business-supplier.entity';
import { BusinessSupplierTypeOrmMapper } from './business-supplier-typeorm.mapper';
import { BusinessSupplier as BusinessSupplierPersistence } from './business-supplier.typeorm-entity';

@Injectable()
export class BusinessSuppliersTypeOrmRepository extends TypeOrmRepository<BusinessSupplier> {
  constructor(
    @InjectRepository(BusinessSupplierPersistence)
    repository: Repository<BusinessSupplier>,
  ) {
    super(repository, new BusinessSupplierTypeOrmMapper());
  }
}
