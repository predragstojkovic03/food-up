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

@Module({
  imports: [
    MailModule,
    EmployeesModule,
    MealSelectionWindowsModule,
    ReportsModule,
    ChangeRequestsModule,
  ],
  providers: [
    MealSelectionWindowOpenedProcessor,
    ChangeRequestStatusProcessor,
    BulkChangeRequestStatusProcessor,
    MealSelectionWindowDeadlineProcessor,
  ],
})
export class NotificationsModule {}
