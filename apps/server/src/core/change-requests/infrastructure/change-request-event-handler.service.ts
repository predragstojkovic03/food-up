import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ChangeRequestStatus } from '@food-up/shared';
import { ChangeRequestApprovedEvent } from '../domain/events/change-request-approved.event';
import { ChangeRequestRejectedEvent } from '../domain/events/change-request-rejected.event';
import { ChangeRequestBulkStatusUpdatedEvent } from '../domain/events/change-request-bulk-status-updated.event';
import {
  BULK_CHANGE_REQUEST_QUEUE,
  CHANGE_REQUEST_QUEUE,
} from 'src/shared/infrastructure/notifications/queue-names';

export interface BulkChangeRequestNotificationJobData {
  employeeId: string;
  items: Array<{ changeRequestId: string; status: ChangeRequestStatus }>;
}

@Injectable()
export class ChangeRequestEventHandler {
  constructor(
    @InjectQueue(CHANGE_REQUEST_QUEUE)
    private readonly _changeRequestQueue: Queue,
    @InjectQueue(BULK_CHANGE_REQUEST_QUEUE)
    private readonly _bulkChangeRequestQueue: Queue,
  ) {}

  @OnEvent(ChangeRequestApprovedEvent.EVENT_NAME)
  async handleApproved(event: ChangeRequestApprovedEvent): Promise<void> {
    await this._changeRequestQueue.add('notify', event.payload);
  }

  @OnEvent(ChangeRequestRejectedEvent.EVENT_NAME)
  async handleRejected(event: ChangeRequestRejectedEvent): Promise<void> {
    await this._changeRequestQueue.add('notify', event.payload);
  }

  @OnEvent(ChangeRequestBulkStatusUpdatedEvent.EVENT_NAME)
  async handleBulkStatusUpdated(
    event: ChangeRequestBulkStatusUpdatedEvent,
  ): Promise<void> {
    const byEmployee = new Map<
      string,
      Array<{ changeRequestId: string; status: ChangeRequestStatus }>
    >();

    for (const item of event.payload.items) {
      const existing = byEmployee.get(item.employeeId) ?? [];
      existing.push({ changeRequestId: item.changeRequestId, status: item.status });
      byEmployee.set(item.employeeId, existing);
    }

    for (const [employeeId, items] of byEmployee) {
      const jobData: BulkChangeRequestNotificationJobData = { employeeId, items };
      await this._bulkChangeRequestQueue.add('notify', jobData);
    }
  }
}
