import { ChangeRequestStatus } from '@food-up/shared';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { ChangeRequestStatusNotificationJobData } from 'src/core/change-requests/infrastructure/change-request-event-handler.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { bullmqTelemetry } from '../bullmq-telemetry';
import { I_MAIL_SERVICE, IMailService } from '../mail/mail.service.interface';
import { CHANGE_REQUEST_QUEUE } from '../queue-names';

@Processor(CHANGE_REQUEST_QUEUE, { telemetry: bullmqTelemetry })
export class ChangeRequestStatusProcessor extends WorkerHost {
  constructor(
    private readonly _employeesService: EmployeesService,
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

    const isApproved = status === ChangeRequestStatus.Approved;

    await this._mailService.send(
      employee.email,
      isApproved
        ? 'Your change request has been approved'
        : 'Your change request has been rejected',
      isApproved
        ? '<p>Your change request has been approved.</p>'
        : '<p>Your change request has been rejected.</p>',
    );

    this._logger.log(
      `job:done queue=${job.queueName} jobId=${job.id} attempt=${job.attemptsMade + 1} employeeId=${employeeId} status=${status} durationMs=${Date.now() - start}`,
      ChangeRequestStatusProcessor.name,
    );
  }
}
