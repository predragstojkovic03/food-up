import { Module } from '@nestjs/common';
import { BusinessesModule } from './businesses/businesses.module';
import { EmployeesModule } from './employees/employees.module';

@Module({
  imports: [BusinessesModule, EmployeesModule]
})
export class CoreModule {}
