import { ChangeRequestStatus } from '@food-up/shared';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { BulkChangeRequestNotificationJobData } from 'src/core/change-requests/infrastructure/change-request-event-handler.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { UserPreferencesService } from 'src/core/user-preferences/application/user-preferences.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { t } from 'src/shared/i18n/i18n.helper';
import { bullmqTelemetry } from '../bullmq-telemetry';
import { I_MAIL_SERVICE, IMailService } from '../mail/mail.service.interface';
import { BULK_CHANGE_REQUEST_QUEUE } from '../queue-names';

@Processor(BULK_CHANGE_REQUEST_QUEUE, { telemetry: bullmqTelemetry })
export class BulkChangeRequestStatusProcessor extends WorkerHost {
  constructor(
    private readonly _employeesService: EmployeesService,
    private readonly _preferencesService: UserPreferencesService,
    @Inject(I_MAIL_SERVICE) private readonly _mailService: IMailService,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {
    super();
  }

  async process(job: Job<BulkChangeRequestNotificationJobData>): Promise<void> {
    const { employeeId, items } = job.data;
    const start = Date.now();
    this._logger.log(
      `job:start queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1}`,
      BulkChangeRequestStatusProcessor.name,
    );

    const employee = await this._employeesService.findOneEnriched(employeeId);
    if (!employee?.email) return;

    const prefs = await this._preferencesService.getOrCreate(employee.identityId);
    const lang = prefs.language;

    const approved = items.filter(
      (i) => i.status === ChangeRequestStatus.Approved,
    );
    const rejected = items.filter(
      (i) => i.status === ChangeRequestStatus.Rejected,
    );

    const intro = t((k) => k.mail.changeRequest.bulkProcessed.intro, lang);
    const lines = [`<p>${intro}</p><ul>`];
    if (approved.length) {
      const approvedLine = t((k) => k.mail.changeRequest.bulkProcessed.approved, lang).replace('{{count}}', String(approved.length));
      lines.push(`<li>${approvedLine}</li>`);
    }
    if (rejected.length) {
      const rejectedLine = t((k) => k.mail.changeRequest.bulkProcessed.rejected, lang).replace('{{count}}', String(rejected.length));
      lines.push(`<li>${rejectedLine}</li>`);
    }
    lines.push('</ul>');

    await this._mailService.send(
      employee.email,
      t((k) => k.mail.changeRequest.bulkProcessed.subject, lang),
      lines.join(''),
    );

    this._logger.log(
      `job:done queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1} employeeId=${employeeId} approved=${approved.length} rejected=${rejected.length} durationMs=${Date.now() - start}`,
      BulkChangeRequestStatusProcessor.name,
    );
  }
}
