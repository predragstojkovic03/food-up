import { ChangeRequestStatus } from '@food-up/shared';
import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Inject } from '@nestjs/common';
import { Job } from 'bullmq';
import { ChangeRequestStatusNotificationJobData } from 'src/core/change-requests/infrastructure/change-request-event-handler.service';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { I_MAIL_SERVICE, IMailService } from '../mail/mail.service.interface';
import { CHANGE_REQUEST_QUEUE } from '../queue-names';

@Processor(CHANGE_REQUEST_QUEUE)
export class ChangeRequestStatusProcessor extends WorkerHost {
  constructor(
    private readonly _employeesService: EmployeesService,
    @Inject(I_MAIL_SERVICE) private readonly _mailService: IMailService,
  ) {
    super();
  }

  async process(job: Job<ChangeRequestStatusNotificationJobData>): Promise<void> {
    const { employeeId, status } = job.data;

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
  }
}
