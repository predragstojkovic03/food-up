import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { Employee } from 'src/core/employees/domain/employee.entity';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import {
  I_TRANSACTION_RUNNER,
  ITransactionRunner,
} from 'src/shared/application/transaction.runner';
import { Business } from '../domain/business.entity';
import { BusinessesService } from './businesses.service';
import { OnboardBusinessDto } from './dto/onboard-business.dto';

/** Creates a business together with its first manager, so the business is usable right away. */
@Injectable()
export class BusinessOnboardingService {
  constructor(
    private readonly _businessesService: BusinessesService,
    @Inject(forwardRef(() => EmployeesService))
    private readonly _employeesService: EmployeesService,
    @Inject(I_TRANSACTION_RUNNER)
    private readonly _transactionRunner: ITransactionRunner,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  onboard(dto: OnboardBusinessDto): Promise<{ business: Business; manager: Employee }> {
    // One transaction: a failed manager creation must not leave a business without a manager
    return this._transactionRunner.run(async () => {
      const business = await this._businessesService.create({
        name: dto.name,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
      });
      const manager = await this._employeesService.createManager({
        ...dto.manager,
        businessId: business.id,
      });

      this._logger.log(
        `Business onboarded: businessId=${business.id} managerId=${manager.id}`,
        BusinessOnboardingService.name,
      );
      return { business, manager };
    });
  }
}
