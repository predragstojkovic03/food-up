import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import {
  EmployeesRepositoryProvider,
  EmployeesUseCaseProviders,
} from './infrastructure/employees.providers';
import { Employee } from './infrastructure/persistence/employee.typeorm-entity';
import { EmployeesController } from './presentation/rest/employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), IdentityModule],
  controllers: [EmployeesController],
  providers: [EmployeesRepositoryProvider, ...EmployeesUseCaseProviders],
  exports: [...EmployeesUseCaseProviders],
})
export class EmployeesModule {}
