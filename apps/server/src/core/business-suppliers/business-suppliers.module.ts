import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesModule } from '../businesses/businesses.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import {
  BusinessSuppliersRepositoryProvider,
  BusinessSuppliersUseCaseProviders,
} from './infrastructure/business-suppliers.providers';
import { BusinessSupplier } from './infrastructure/persistence/business-supplier.typeorm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessSupplier]),
    forwardRef(() => SuppliersModule),
    BusinessesModule,
  ],
  providers: [
    BusinessSuppliersRepositoryProvider,
    ...BusinessSuppliersUseCaseProviders,
  ],
  exports: [...BusinessSuppliersUseCaseProviders],
})
export class BusinessSuppliersModule {}
