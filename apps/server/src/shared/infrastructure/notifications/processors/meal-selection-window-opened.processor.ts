import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { UserPreferencesService } from 'src/core/user-preferences/application/user-preferences.service';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { t } from 'src/shared/i18n/i18n.helper';
import { MealWindowNotificationJobData } from 'src/core/meal-selection-windows/infrastructure/meal-selection-window-event-handler.service';
import { bullmqTelemetry } from '../bullmq-telemetry';
import { I_MAIL_SERVICE, IMailService } from '../mail/mail.service.interface';
import { MEAL_WINDOW_QUEUE } from '../queue-names';

@Processor(MEAL_WINDOW_QUEUE, { telemetry: bullmqTelemetry })
export class MealSelectionWindowOpenedProcessor extends WorkerHost {
  constructor(
    private readonly _employeesService: EmployeesService,
    private readonly _preferencesService: UserPreferencesService,
    @Inject(I_MAIL_SERVICE) private readonly _mailService: IMailService,
    @Inject(I_CONFIG_SERVICE)
    private readonly _configService: IConfigService<EnvironmentVariables, true>,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {
    super();
  }

  async process(job: Job<MealWindowNotificationJobData>): Promise<void> {
    const { windowId, employeeId } = job.data;
    const start = Date.now();
    this._logger.log(
      `job:start queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1}`,
      MealSelectionWindowOpenedProcessor.name,
    );

    const employee = await this._employeesService.findOneEnriched(employeeId);
    if (!employee?.email) return;

    const prefs = await this._preferencesService.getOrCreate(employee.identityId);
    const lang = prefs.language;
    const webAppUrl = this._configService.get('WEB_APP_URL');

    await this._mailService.send(
      employee.email,
      t((k) => k.mail.mealWindow.subject, lang),
      `<p>${t((k) => k.mail.mealWindow.body, lang)} <a href="${webAppUrl}">Click here</a></p>`,
    );

    this._logger.log(
      `job:done queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1} windowId=${windowId} employeeId=${employeeId} durationMs=${Date.now() - start}`,
      MealSelectionWindowOpenedProcessor.name,
    );
  }
}
