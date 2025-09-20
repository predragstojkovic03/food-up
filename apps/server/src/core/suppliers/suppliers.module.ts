import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessSuppliersModule } from '../business-suppliers/business-suppliers.module';
import { BusinessesModule } from '../businesses/businesses.module';
import { SuppliersService } from './application/suppliers.service';
import { Supplier } from './infrastructure/persistence/supplier.typeorm-entity';
import { SuppliersRepositoryProvider } from './infrastructure/suppliers.providers';
import { SuppliersController } from './presentation/rest/suppliers.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Supplier]),
    BusinessesModule,
    forwardRef(() => BusinessSuppliersModule),
  ],
  providers: [SuppliersRepositoryProvider, SuppliersService],
  exports: [SuppliersService],
  controllers: [SuppliersController],
})
export class SuppliersModule {}
