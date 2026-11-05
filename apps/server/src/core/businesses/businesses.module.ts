import { forwardRef, Module } from '@nestjs/common';
import { BusinessInvitesModule } from '../business-invites/business-invites.module';
import { EmployeesModule } from '../employees/employees.module';
import { BusinessOnboardingService } from './application/business-onboarding.service';
import { BusinessesService } from './application/businesses.service';
import { BusinessRepositoryProvider } from './infrastructure/business.providers';
import { BusinessOnboardingController } from './presentation/rest/business-onboarding.controller';
import { BusinessesController } from './presentation/rest/businesses.controller';

@Module({
  imports: [BusinessInvitesModule, forwardRef(() => EmployeesModule)],
  controllers: [BusinessesController, BusinessOnboardingController],
  providers: [BusinessesService, BusinessOnboardingService, BusinessRepositoryProvider],
  exports: [BusinessesService],
})
export class BusinessesModule {}
