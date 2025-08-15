import { Provider } from '@nestjs/common';
import { FindMealSelectionWindowUseCase } from 'src/core/meal-selection-windows/application/use-cases/find-meal-selection-window.use-case';
import { FindSupplierUseCase } from 'src/core/suppliers/application/use-cases/find-supplier.use-case';
import { CreateReportUseCase } from '../application/use-cases/create-report.use-case';
import { DeleteReportUseCase } from '../application/use-cases/delete-report.use-case';
import { FindAllReportsUseCase } from '../application/use-cases/find-all-reports.use-case';
import { FindReportUseCase } from '../application/use-cases/find-report.use-case';
import { UpdateReportUseCase } from '../application/use-cases/update-report.use-case';
import {
  I_REPORTS_REPOSITORY,
  IReportsRepository,
} from '../domain/reports.repository.interface';
import { ReportsTypeOrmRepository } from './persistence/reports-typeorm.repository';

export const ReportsRepositoryProvide: Provider = {
  provide: I_REPORTS_REPOSITORY,
  useClass: ReportsTypeOrmRepository,
};

export const ReportsUseCaseProviders: Provider[] = [
  {
    provide: CreateReportUseCase,
    useFactory: (
      repo: IReportsRepository,
      findSupplierUseCase: FindSupplierUseCase,
      findMealSelectionWindowUseCase: FindMealSelectionWindowUseCase,
    ) =>
      new CreateReportUseCase(
        repo,
        findSupplierUseCase,
        findMealSelectionWindowUseCase,
      ),
    inject: [
      I_REPORTS_REPOSITORY,
      FindSupplierUseCase,
      FindMealSelectionWindowUseCase,
    ],
  },
  {
    provide: FindAllReportsUseCase,
    useFactory: (repo: IReportsRepository) => new FindAllReportsUseCase(repo),
    inject: [I_REPORTS_REPOSITORY],
  },
  {
    provide: FindReportUseCase,
    useFactory: (repo) => new FindReportUseCase(repo),
    inject: [I_REPORTS_REPOSITORY],
  },
  {
    provide: UpdateReportUseCase,
    useFactory: (
      repo: IReportsRepository,
      findSupplierUseCase: FindSupplierUseCase,
      findMealSelectionWindowUseCase: FindMealSelectionWindowUseCase,
    ) =>
      new UpdateReportUseCase(
        repo,
        findSupplierUseCase,
        findMealSelectionWindowUseCase,
      ),
    inject: [
      I_REPORTS_REPOSITORY,
      FindSupplierUseCase,
      FindMealSelectionWindowUseCase,
    ],
  },
  {
    provide: DeleteReportUseCase,
    useFactory: (repo: IReportsRepository) => new DeleteReportUseCase(repo),
    inject: [I_REPORTS_REPOSITORY],
  },
];
