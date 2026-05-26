import { Module, Provider } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { MealSelectionWindowsModule } from '../meal-selection-windows/meal-selection-windows.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { MenuPeriodsModule } from '../menu-periods/menu-periods.module';
import { MealSelectionsService } from './application/meal-selections.service';
import { I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY } from './application/queries/meal-selection-overview-query-repository.interface';
import { MealSelectionOverviewQueryService } from './application/queries/meal-selection-overview-query.service';
import { MealSelectionsRepositoryProvide } from './infrastructure/meal-selections.providers';
import { MealSelectionOverviewQueryTypeOrmRepository } from './infrastructure/persistence/meal-selection-overview-query-typeorm.repository';
import { MealSelectionsController } from './presentation/rest/meal-selections.controller';

const MealSelectionOverviewQueryRepositoryProvider: Provider = {
  provide: I_MEAL_SELECTION_OVERVIEW_QUERY_REPOSITORY,
  useClass: MealSelectionOverviewQueryTypeOrmRepository,
};

@Module({
  imports: [
    MenuPeriodsModule,
    EmployeesModule,
    MenuItemsModule,
    MealSelectionWindowsModule,
  ],
  controllers: [MealSelectionsController],
  providers: [
    MealSelectionsRepositoryProvide,
    MealSelectionOverviewQueryRepositoryProvider,
    MealSelectionsService,
    MealSelectionOverviewQueryService,
  ],
  exports: [MealSelectionsService],
})
export class MealSelectionsModule {}
