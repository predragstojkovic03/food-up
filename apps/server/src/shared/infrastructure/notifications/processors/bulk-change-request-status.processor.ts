import { Inject, Injectable } from '@nestjs/common';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { ChangeRequestStatus } from '@food-up/shared';
import { BulkChangeRequestNotificationJobData } from 'src/core/change-requests/infrastructure/change-request-event-handler.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { I_MAIL_SERVICE, IMailService } from '../mail.service.interface';
import { BULK_CHANGE_REQUEST_QUEUE } from '../queue-names';

@Processor(BULK_CHANGE_REQUEST_QUEUE)
@Injectable()
export class BulkChangeRequestStatusProcessor extends WorkerHost {
  constructor(
    private readonly _employeesService: EmployeesService,
    @Inject(I_MAIL_SERVICE) private readonly _mailService: IMailService,
  ) {
    super();
  }

  async process(job: Job<BulkChangeRequestNotificationJobData>): Promise<void> {
    const { employeeId, items } = job.data;

    const employee = await this._employeesService.findOneEnriched(employeeId);
    if (!employee?.email) return;

    const approved = items.filter((i) => i.status === ChangeRequestStatus.Approved);
    const rejected = items.filter((i) => i.status === ChangeRequestStatus.Rejected);

    const lines = ['<p>Your change requests have been processed:</p><ul>'];
    if (approved.length) lines.push(`<li>Approved: ${approved.length} request(s)</li>`);
    if (rejected.length) lines.push(`<li>Rejected: ${rejected.length} request(s)</li>`);
    lines.push('</ul>');

    await this._mailService.send(
      employee.email,
      'Your change requests have been processed',
      lines.join(''),
    );
  }
}
