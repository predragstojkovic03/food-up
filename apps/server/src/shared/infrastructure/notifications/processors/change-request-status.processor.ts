import { ChangeRequestStatus } from '@food-up/shared';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { ChangeRequestStatusNotificationJobData } from 'src/core/change-requests/infrastructure/change-request-event-handler.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { UserPreferencesService } from 'src/core/user-preferences/application/user-preferences.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { t } from 'src/shared/i18n/i18n.helper';
import { bullmqTelemetry } from '../bullmq-telemetry';
import { I_MAIL_SERVICE, IMailService } from '../mail/mail.service.interface';
import { CHANGE_REQUEST_QUEUE } from '../queue-names';

@Processor(CHANGE_REQUEST_QUEUE, { telemetry: bullmqTelemetry })
export class ChangeRequestStatusProcessor extends WorkerHost {
  constructor(
    private readonly _employeesService: EmployeesService,
    private readonly _preferencesService: UserPreferencesService,
    @Inject(I_MAIL_SERVICE) private readonly _mailService: IMailService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {
    super();
  }

  async process(job: Job<ChangeRequestStatusNotificationJobData>): Promise<void> {
    const { employeeId, status } = job.data;
    const start = Date.now();
    this._logger.log(
      `job:start queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1}`,
      ChangeRequestStatusProcessor.name,
    );

    const employee = await this._employeesService.findOneEnriched(employeeId);
    if (!employee?.email) return;

    const prefs = await this._preferencesService.getOrCreate(employee.identityId);
    const lang = prefs.language;
    const isApproved = status === ChangeRequestStatus.Approved;

    await this._mailService.send(
      employee.email,
      isApproved
        ? t((k) => k.mail.changeRequest.approved.subject, lang)
        : t((k) => k.mail.changeRequest.rejected.subject, lang),
      isApproved
        ? `<p>${t((k) => k.mail.changeRequest.approved.body, lang)}</p>`
        : `<p>${t((k) => k.mail.changeRequest.rejected.body, lang)}</p>`,
    );

    this._logger.log(
      `job:done queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1} employeeId=${employeeId} status=${status} durationMs=${Date.now() - start}`,
      ChangeRequestStatusProcessor.name,
    );
  }
}
