import { InjectQueue } from '@nestjs/bullmq';
import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { Queue } from 'bullmq';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import {
  MEAL_WINDOW_QUEUE,
  WINDOW_DEADLINE_QUEUE,
} from 'src/shared/infrastructure/notifications/queue-names';
import { MealSelectionWindowUpdatedEvent } from '../domain/events/meal-selection-window-updated.event';

export interface MealWindowNotificationJobData {
  windowId: string;
  employeeId: string;
}

export interface WindowDeadlineJobData {
  mealSelectionWindowId: string;
}

@Injectable()
export class MealSelectionWindowEventHandler {
  constructor(
    @InjectQueue(MEAL_WINDOW_QUEUE)
    private readonly _mealWindowQueue: Queue<MealWindowNotificationJobData>,
    @InjectQueue(WINDOW_DEADLINE_QUEUE)
    private readonly _deadlineQueue: Queue<WindowDeadlineJobData>,
    private readonly _employeesService: EmployeesService,
  ) {}

  @OnEvent(MealSelectionWindowUpdatedEvent.EVENT_NAME)
  async handleWindowUpdated(
    event: MealSelectionWindowUpdatedEvent,
  ): Promise<void> {
    if (event.payload.notifyEmployees) {
      const employees = await this._employeesService.findAllByBusinessEnriched(
        event.payload.businessId,
      );
      for (const employee of employees.filter((e) => e.email)) {
        await this._mealWindowQueue.add(
          'notify',
          { windowId: event.payload.mealSelectionWindowId, employeeId: employee.id },
          { jobId: `${event.payload.mealSelectionWindowId}_${employee.id}` },
        );
      }
    }

    const { mealSelectionWindowId, endTime, notifyOnDeadline } = event.payload;

    if (notifyOnDeadline) {
      const delay = Math.max(0, new Date(endTime).getTime() - Date.now());
      // Using windowId as job ID causes BullMQ to replace any existing delayed job for this window
      await this._deadlineQueue.add(
        'notify-deadline',
        { mealSelectionWindowId },
        { jobId: mealSelectionWindowId, delay },
      );
    } else {
      await this._deadlineQueue.remove(mealSelectionWindowId);
    }
  }
}
