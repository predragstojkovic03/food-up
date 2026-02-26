import { forwardRef, Module } from '@nestjs/common';
import { BusinessSuppliersModule } from '../business-suppliers/business-suppliers.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { EmployeesModule } from '../employees/employees.module';
import { IdentityModule } from '../identity/identity.module';
import { SuppliersService } from './application/suppliers.service';
import { SuppliersRepositoryProvider } from './infrastructure/suppliers.providers';
import { SuppliersController } from './presentation/rest/suppliers.controller';

@Module({
  imports: [
    BusinessesModule,
    IdentityModule,
    EmployeesModule,
    forwardRef(() => BusinessSuppliersModule),
  ],
  providers: [SuppliersRepositoryProvider, SuppliersService],
  exports: [SuppliersService],
  controllers: [SuppliersController],
})
export class SuppliersModule {}
