import { Provider } from '@nestjs/common';
import { FindMenuItemUseCase } from 'src/core/menu-items/application/use-cases/find-menu-item.use-case';
import { FindReportUseCase } from 'src/core/reports/application/use-cases/find-report.use-case';
import { CreateReportItemUseCase } from '../application/use-cases/create-report-item.use-case';
import { DeleteReportItemUseCase } from '../application/use-cases/delete-report-item.use-case';
import { FindAllReportItemsUseCase } from '../application/use-cases/find-all-report-items.use-case';
import { FindReportItemUseCase } from '../application/use-cases/find-report-item.use-case';
import { UpdateReportItemUseCase } from '../application/use-cases/update-report-item.use-case';
import {
  I_REPORT_ITEMS_REPOSITORY,
  IReportItemsRepository,
} from '../domain/report-items.repository.interface';
import { ReportItemsTypeOrmRepository } from './persistence/report-items-typeorm.repository';

export const ReportItemsRepositoryProvide: Provider = {
  provide: I_REPORT_ITEMS_REPOSITORY,
  useClass: ReportItemsTypeOrmRepository,
};

export const ReportItemsUseCaseProviders: Provider[] = [
  {
    provide: CreateReportItemUseCase,
    useFactory: (
      repo: IReportItemsRepository,
      findReportUseCase: FindReportUseCase,
      findMenuItemUseCase: FindMenuItemUseCase,
    ) =>
      new CreateReportItemUseCase(repo, findReportUseCase, findMenuItemUseCase),
    inject: [
      I_REPORT_ITEMS_REPOSITORY,
      FindReportItemUseCase,
      FindMenuItemUseCase,
    ],
  },
  {
    provide: FindAllReportItemsUseCase,
    useFactory: (repo: IReportItemsRepository) =>
      new FindAllReportItemsUseCase(repo),
    inject: [I_REPORT_ITEMS_REPOSITORY],
  },
  {
    provide: FindReportItemUseCase,
    useFactory: (repo: IReportItemsRepository) =>
      new FindReportItemUseCase(repo),
    inject: [I_REPORT_ITEMS_REPOSITORY],
  },
  {
    provide: UpdateReportItemUseCase,
    useFactory: (
      repo: IReportItemsRepository,
      findReportUseCase: FindReportUseCase,
      findMenuItemUseCase: FindMenuItemUseCase,
    ) =>
      new UpdateReportItemUseCase(repo, findReportUseCase, findMenuItemUseCase),
    inject: [I_REPORT_ITEMS_REPOSITORY, FindReportUseCase, FindMenuItemUseCase],
  },
  {
    provide: DeleteReportItemUseCase,
    useFactory: (repo: IReportItemsRepository) =>
      new DeleteReportItemUseCase(repo),
    inject: [I_REPORT_ITEMS_REPOSITORY],
  },
];
