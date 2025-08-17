import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesModule } from '../businesses/businesses.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { BusinessSuppliersService } from './application/business-suppliers.service';
import { BusinessSuppliersRepositoryProvider } from './infrastructure/business-suppliers.providers';
import { BusinessSupplier } from './infrastructure/persistence/business-supplier.typeorm-entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([BusinessSupplier]),
    forwardRef(() => SuppliersModule),
    BusinessesModule,
  ],
  providers: [BusinessSuppliersRepositoryProvider, BusinessSuppliersService],
  exports: [BusinessSuppliersService],
})
export class BusinessSuppliersModule {}
