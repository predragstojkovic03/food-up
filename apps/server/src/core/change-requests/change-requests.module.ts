import { BullModule } from '@nestjs/bullmq';
import { Module, Provider } from '@nestjs/common';
import {
  BULK_CHANGE_REQUEST_QUEUE,
  CHANGE_REQUEST_QUEUE,
} from 'src/shared/infrastructure/notifications/queue-names';
import { EmployeesModule } from '../employees/employees.module';
import { MealSelectionWindowsModule } from '../meal-selection-windows/meal-selection-windows.module';
import { MealSelectionsModule } from '../meal-selections/meal-selections.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { ChangeRequestsService } from './application/change-requests.service';
import { I_CHANGE_REQUESTS_QUERY_REPOSITORY } from './application/queries/change-requests-query-repository.interface';
import { ChangeRequestsQueryService } from './application/queries/change-requests-query.service';
import { ChangeRequestEventHandler } from './infrastructure/change-request-event-handler.service';
import { ChangeRequestsRepositoryProvide } from './infrastructure/change-requests.providers';
import { ChangeRequestsQueryTypeOrmRepository } from './infrastructure/persistence/change-requests-query-typeorm.repository';
import { ChangeRequestsController } from './presentation/rest/change-requests.controller';

const ChangeRequestsQueryRepositoryProvider: Provider = {
  provide: I_CHANGE_REQUESTS_QUERY_REPOSITORY,
  useClass: ChangeRequestsQueryTypeOrmRepository,
};

@Module({
  imports: [
    MealSelectionsModule,
    MenuItemsModule,
    EmployeesModule,
    MealSelectionWindowsModule,
    BullModule.registerQueue(
      {
        name: CHANGE_REQUEST_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      },
      {
        name: BULK_CHANGE_REQUEST_QUEUE,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
        },
      },
    ),
  ],
  controllers: [ChangeRequestsController],
  providers: [
    ChangeRequestsRepositoryProvide,
    ChangeRequestsQueryRepositoryProvider,
    ChangeRequestsService,
    ChangeRequestsQueryService,
    ChangeRequestEventHandler,
  ],
  exports: [ChangeRequestsQueryService],
})
export class ChangeRequestsModule {}
