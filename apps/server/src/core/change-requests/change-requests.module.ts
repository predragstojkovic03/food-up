import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmployeesModule } from '../employees/employees.module';
import { MealSelectionsModule } from '../meal-selections/meal-selections.module';
import { MenuItemsModule } from '../menu-items/menu-items.module';
import { ChangeRequestsService } from './application/change-requests.service';
import { ChangeRequestsRepositoryProvide } from './infrastructure/change-requests.providers';
import { ChangeRequest } from './infrastructure/persistence/change-request.typeorm-entity';
import { ChangeRequestsController } from './presentation/rest/change-requests.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChangeRequest]),
    MealSelectionsModule,
    MenuItemsModule,
    EmployeesModule,
  ],
  controllers: [ChangeRequestsController],
  providers: [ChangeRequestsRepositoryProvide, ChangeRequestsService],
})
export class ChangeRequestsModule {}
