import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
  BusinessSuppliersRepositoryProvider,
  BusinessSuppliersUseCaseProviders,
} from './infrastructure/business-suppliers.providers';
import { BusinessSupplier } from './infrastructure/persistence/business-supplier.typeorm-entity';

@Module({
  imports: [TypeOrmModule.forFeature([BusinessSupplier])],
  providers: [
    BusinessSuppliersRepositoryProvider,
    ...BusinessSuppliersUseCaseProviders,
  ],
  exports: [
    BusinessSuppliersRepositoryProvider,
    ...BusinessSuppliersUseCaseProviders,
  ],
})
export class BusinessSuppliersModule {}
