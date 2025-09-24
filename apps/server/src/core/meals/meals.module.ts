import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessesModule } from '../businesses/businesses.module';
import { EmployeesModule } from '../employees/employees.module';
import { IdentityModule } from '../identity/identity.module';
import { SuppliersModule } from '../suppliers/suppliers.module';
import { MealsService } from './application/meals.service';
import { MealsRepositoryProvider } from './infrastructure/meals.providers';
import { Meal } from './infrastructure/persistence/meal.typeorm-entity';
import { MealsController } from './presentation/rest/meals.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Meal]),
    SuppliersModule,
    IdentityModule,
    EmployeesModule,
    BusinessesModule,
  ],
  controllers: [MealsController],
  providers: [MealsRepositoryProvider, MealsService],
  exports: [MealsService],
})
export class MealsModule {}
