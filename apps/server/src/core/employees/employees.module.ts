import { Module } from '@nestjs/common';
import { EmployeesController } from './presentation/rest/employees.controller';

@Module({
  controllers: [EmployeesController],
})
export class EmployeesModule {}
