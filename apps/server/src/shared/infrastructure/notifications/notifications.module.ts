import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { EmployeesModule } from 'src/core/employees/employees.module';
import { MealSelectionWindowsModule } from 'src/core/meal-selection-windows/meal-selection-windows.module';
import { I_MAIL_SERVICE } from './mail.service.interface';
import { MockMailService } from './mock-mail.service';
import { RedisClientProvider } from './redis-client.provider';
import {
  BULK_CHANGE_REQUEST_QUEUE,
  CHANGE_REQUEST_QUEUE,
  MEAL_WINDOW_QUEUE,
} from './queue-names';
import { MealSelectionWindowOpenedProcessor } from './processors/meal-selection-window-opened.processor';
import { ChangeRequestStatusProcessor } from './processors/change-request-status.processor';
import { BulkChangeRequestStatusProcessor } from './processors/bulk-change-request-status.processor';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: MEAL_WINDOW_QUEUE },
      { name: CHANGE_REQUEST_QUEUE },
      { name: BULK_CHANGE_REQUEST_QUEUE },
    ),
    EmployeesModule,
    MealSelectionWindowsModule,
  ],
  providers: [
    RedisClientProvider,
    { provide: I_MAIL_SERVICE, useClass: MockMailService },
    MealSelectionWindowOpenedProcessor,
    ChangeRequestStatusProcessor,
    BulkChangeRequestStatusProcessor,
  ],
})
export class NotificationsModule {}
