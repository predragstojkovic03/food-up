import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { MealWindowNotificationJobData } from 'src/core/meal-selection-windows/infrastructure/meal-selection-window-event-handler.service';
import { I_MAIL_SERVICE, IMailService } from '../mail/mail.service.interface';
import { MEAL_WINDOW_QUEUE } from '../queue-names';

@Processor(MEAL_WINDOW_QUEUE)
export class MealSelectionWindowOpenedProcessor extends WorkerHost {
  constructor(
    private readonly _employeesService: EmployeesService,
    @Inject(I_MAIL_SERVICE) private readonly _mailService: IMailService,
    @Inject(I_CONFIG_SERVICE)
    private readonly _configService: IConfigService<EnvironmentVariables, true>,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {
    super();
  }

  async process(job: Job<MealWindowNotificationJobData>): Promise<void> {
    const { windowId, employeeId } = job.data;

    const employee = await this._employeesService.findOneEnriched(employeeId);
    if (!employee?.email) return;

    const webAppUrl = this._configService.get('WEB_APP_URL');
    await this._mailService.send(
      employee.email,
      'Meal selection window is now open',
      `<p>The meal selection window is now open. <a href="${webAppUrl}">Click here</a> to select your meals.</p>`,
    );

    this._logger.log(
      `Window-open notification sent windowId=${windowId} employeeId=${employeeId}`,
      MealSelectionWindowOpenedProcessor.name,
    );
  }
}
