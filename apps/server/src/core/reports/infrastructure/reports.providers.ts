import { Provider } from '@nestjs/common';
import { CreateReportUseCase } from '../application/use-cases/create-report.use-case';
import { DeleteReportUseCase } from '../application/use-cases/delete-report.use-case';
import { FindAllReportsUseCase } from '../application/use-cases/find-all-reports.use-case';
import { FindReportUseCase } from '../application/use-cases/find-report.use-case';
import { UpdateReportUseCase } from '../application/use-cases/update-report.use-case';
import { I_REPORTS_REPOSITORY } from '../domain/reports.repository.interface';
import { ReportsTypeOrmRepository } from './persistence/reports-typeorm.repository';

export const ReportsRepositoryProvide: Provider = {
  provide: I_REPORTS_REPOSITORY,
  useClass: ReportsTypeOrmRepository,
};

export const ReportsUseCaseProviders: Provider[] = [
  {
    provide: CreateReportUseCase,
    useFactory: (repo) => new CreateReportUseCase(repo),
    inject: [I_REPORTS_REPOSITORY],
  },
  {
    provide: FindAllReportsUseCase,
    useFactory: (repo) => new FindAllReportsUseCase(repo),
    inject: [I_REPORTS_REPOSITORY],
  },
  {
    provide: FindReportUseCase,
    useFactory: (repo) => new FindReportUseCase(repo),
    inject: [I_REPORTS_REPOSITORY],
  },
  {
    provide: UpdateReportUseCase,
    useFactory: (repo) => new UpdateReportUseCase(repo),
    inject: [I_REPORTS_REPOSITORY],
  },
  {
    provide: DeleteReportUseCase,
    useFactory: (repo) => new DeleteReportUseCase(repo),
    inject: [I_REPORTS_REPOSITORY],
  },
];
