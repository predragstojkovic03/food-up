import { Module, Provider } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { MealSelectionWindowsModule } from '../meal-selection-windows/meal-selection-windows.module';
import { MealSelectionsModule } from '../meal-selections/meal-selections.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { ChangeRequestsQueryService } from './application/queries/change-requests-query.service';
import { I_CHANGE_REQUESTS_QUERY_REPOSITORY } from './application/queries/change-requests-query-repository.interface';
import { ChangeRequestsService } from './application/change-requests.service';
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
  ],
  controllers: [ChangeRequestsController],
  providers: [
    ChangeRequestsRepositoryProvide,
    ChangeRequestsQueryRepositoryProvider,
    ChangeRequestsService,
    ChangeRequestsQueryService,
  ],
})
export class ChangeRequestsModule {}
