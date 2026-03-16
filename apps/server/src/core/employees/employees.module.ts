import { Module } from '@nestjs/common';
import { BusinessInvitesModule } from '../business-invites/business-invites.module';
import { IdentityModule } from '../identity/identity.module';
import { EmployeesService } from './application/employees.service';
import { EmployeesRepositoryProvider } from './infrastructure/employees.providers';
import { EmployeesController } from './presentation/rest/employees.controller';

@Module({
  imports: [IdentityModule, BusinessInvitesModule],
  controllers: [EmployeesController],
  providers: [EmployeesRepositoryProvider, EmployeesService],
  exports: [EmployeesService],
})
export class EmployeesModule {}
