import { forwardRef, Module } from '@nestjs/common';
import { BusinessInvitesModule } from '../business-invites/business-invites.module';
import { EmployeesModule } from '../employees/employees.module';
import { BusinessesService } from './application/businesses.service';
import { BusinessRepositoryProvider } from './infrastructure/business.providers';
import { BusinessesController } from './presentation/rest/businesses.controller';

@Module({
  imports: [BusinessInvitesModule, forwardRef(() => EmployeesModule)],
  controllers: [BusinessesController],
  providers: [BusinessesService, BusinessRepositoryProvider],
  exports: [BusinessesService],
})
export class BusinessesModule {}
