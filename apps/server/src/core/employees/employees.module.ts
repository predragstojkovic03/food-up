import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { IdentityModule } from '../identity/identity.module';
import { EmployeesService } from './application/employees.service';
import { EmployeesRepositoryProvider } from './infrastructure/employees.providers';
import { Employee } from './infrastructure/persistence/employee.typeorm-entity';
import { EmployeesController } from './presentation/rest/employees.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Employee]), IdentityModule],
  controllers: [EmployeesController],
  providers: [EmployeesRepositoryProvider, EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
