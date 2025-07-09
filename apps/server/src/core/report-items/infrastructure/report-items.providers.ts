import { Provider } from '@nestjs/common';
import { CreateReportItemUseCase } from '../application/use-cases/create-report-item.use-case';
import { DeleteReportItemUseCase } from '../application/use-cases/delete-report-item.use-case';
import { FindAllReportItemsUseCase } from '../application/use-cases/find-all-report-items.use-case';
import { FindReportItemUseCase } from '../application/use-cases/find-report-item.use-case';
import { UpdateReportItemUseCase } from '../application/use-cases/update-report-item.use-case';
import { I_REPORT_ITEMS_REPOSITORY } from '../domain/report-items.repository.interface';
import { ReportItemsTypeOrmRepository } from './persistence/report-items-typeorm.repository';

export const ReportItemsRepositoryProvide: Provider = {
  provide: I_REPORT_ITEMS_REPOSITORY,
  useClass: ReportItemsTypeOrmRepository,
};

export const ReportItemsUseCaseProviders: Provider[] = [
  {
    provide: CreateReportItemUseCase,
    useFactory: (repo) => new CreateReportItemUseCase(repo),
    inject: [I_REPORT_ITEMS_REPOSITORY],
  },
  {
    provide: FindAllReportItemsUseCase,
    useFactory: (repo) => new FindAllReportItemsUseCase(repo),
    inject: [I_REPORT_ITEMS_REPOSITORY],
  },
  {
    provide: FindReportItemUseCase,
    useFactory: (repo) => new FindReportItemUseCase(repo),
    inject: [I_REPORT_ITEMS_REPOSITORY],
  },
  {
    provide: UpdateReportItemUseCase,
    useFactory: (repo) => new UpdateReportItemUseCase(repo),
    inject: [I_REPORT_ITEMS_REPOSITORY],
  },
  {
    provide: DeleteReportItemUseCase,
    useFactory: (repo) => new DeleteReportItemUseCase(repo),
    inject: [I_REPORT_ITEMS_REPOSITORY],
  },
];
