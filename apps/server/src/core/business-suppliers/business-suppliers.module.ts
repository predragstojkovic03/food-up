import { forwardRef, Module } from '@nestjs/common';
import { BusinessesModule } from '../businesses/businesses.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { BusinessSuppliersService } from './application/business-suppliers.service';
import { BusinessSuppliersRepositoryProvider } from './infrastructure/business-suppliers.providers';

@Module({
  imports: [
    forwardRef(() => SuppliersModule),
    BusinessesModule,
  ],
  providers: [BusinessSuppliersRepositoryProvider, BusinessSuppliersService],
  exports: [BusinessSuppliersService],
})
export class BusinessSuppliersModule {}
