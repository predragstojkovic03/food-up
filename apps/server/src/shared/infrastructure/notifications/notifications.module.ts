import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { ChangeRequestsModule } from 'src/core/change-requests/change-requests.module';
import { EmployeesModule } from 'src/core/employees/employees.module';
import { MealSelectionWindowsModule } from 'src/core/meal-selection-windows/meal-selection-windows.module';
import { ReportsModule } from 'src/core/reports/reports.module';
import { MailModule } from './mail/mail.module';
import { BulkChangeRequestStatusProcessor } from './processors/bulk-change-request-status.processor';
import { ChangeRequestStatusProcessor } from './processors/change-request-status.processor';
import { MealSelectionWindowDeadlineProcessor } from './processors/meal-selection-window-deadline.processor';
import { MealSelectionWindowOpenedProcessor } from './processors/meal-selection-window-opened.processor';
import {
  BULK_CHANGE_REQUEST_QUEUE,
  CHANGE_REQUEST_QUEUE,
  MEAL_WINDOW_QUEUE,
  WINDOW_DEADLINE_QUEUE,
} from './queue-names';
import { RedisClientProvider } from './redis-client.provider';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: MEAL_WINDOW_QUEUE },
      { name: CHANGE_REQUEST_QUEUE },
      { name: BULK_CHANGE_REQUEST_QUEUE },
      { name: WINDOW_DEADLINE_QUEUE },
    ),
    MailModule,
    EmployeesModule,
    MealSelectionWindowsModule,
    ReportsModule,
    ChangeRequestsModule,
  ],
  providers: [
    RedisClientProvider,
    MealSelectionWindowOpenedProcessor,
    ChangeRequestStatusProcessor,
    BulkChangeRequestStatusProcessor,
    MealSelectionWindowDeadlineProcessor,
  ],
})
export class NotificationsModule {}
