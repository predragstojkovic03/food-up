import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesModule } from '../businesses/businesses.module';
import { Supplier } from './infrastructure/persistence/supplier.typeorm-entity';
import {
  SuppliersRepositoryProvider,
  SuppliersUseCaseProviders,
} from './infrastructure/suppliers.providers';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier]), BusinessesModule],
  providers: [SuppliersRepositoryProvider, ...SuppliersUseCaseProviders],
  exports: [...SuppliersUseCaseProviders],
})
export class SuppliersModule {}
