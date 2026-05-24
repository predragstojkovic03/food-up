import { CacheModule } from '@nestjs/cache-manager';
import { Module, Provider } from '@nestjs/common';
import { EmployeesModule } from '../employees/employees.module';
import { DashboardQueryService } from './application/dashboard-query.service';
import { I_DASHBOARD_QUERY_REPOSITORY } from './application/queries/dashboard-query-repository.interface';
import { DashboardQueryTypeOrmRepository } from './infrastructure/persistence/dashboard-query-typeorm.repository';
import { DashboardController } from './presentation/rest/dashboard.controller';

const DashboardQueryRepositoryProvider: Provider = {
  provide: I_DASHBOARD_QUERY_REPOSITORY,
  useClass: DashboardQueryTypeOrmRepository,
};

@Module({
  imports: [CacheModule.register({ ttl: 300_000 }), EmployeesModule],
  controllers: [DashboardController],
  providers: [DashboardQueryRepositoryProvider, DashboardQueryService],
})
export class DashboardModule {}
