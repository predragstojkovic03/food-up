import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Supplier } from './infrastructure/persistence/supplier.typeorm-entity';
import {
  SuppliersRepositoryProvider,
  SuppliersUseCaseProviders,
} from './infrastructure/suppliers.providers';

@Module({
  imports: [TypeOrmModule.forFeature([Supplier])],
  providers: [SuppliersRepositoryProvider, ...SuppliersUseCaseProviders],
  exports: [SuppliersRepositoryProvider, ...SuppliersUseCaseProviders],
})
export class SuppliersModule {}
