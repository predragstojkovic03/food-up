import { ChangeRequestStatus } from '@food-up/shared';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { BulkChangeRequestNotificationJobData } from 'src/core/change-requests/infrastructure/change-request-event-handler.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { bullmqTelemetry } from '../bullmq-telemetry';
import { I_MAIL_SERVICE, IMailService } from '../mail/mail.service.interface';
import { BULK_CHANGE_REQUEST_QUEUE } from '../queue-names';

@Processor(BULK_CHANGE_REQUEST_QUEUE, { telemetry: bullmqTelemetry })
export class BulkChangeRequestStatusProcessor extends WorkerHost {
  constructor(
    private readonly _employeesService: EmployeesService,
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

    const approved = items.filter(
      (i) => i.status === ChangeRequestStatus.Approved,
    );
    const rejected = items.filter(
      (i) => i.status === ChangeRequestStatus.Rejected,
    );

    const lines = ['<p>Your change requests have been processed:</p><ul>'];
    if (approved.length)
      lines.push(`<li>Approved: ${approved.length} request(s)</li>`);
    if (rejected.length)
      lines.push(`<li>Rejected: ${rejected.length} request(s)</li>`);
    lines.push('</ul>');

    await this._mailService.send(
      employee.email,
      'Your change requests have been processed',
      lines.join(''),
    );

    this._logger.log(
      `job:done queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1} employeeId=${employeeId} approved=${approved.length} rejected=${rejected.length} durationMs=${Date.now() - start}`,
      BulkChangeRequestStatusProcessor.name,
    );
  }
}
