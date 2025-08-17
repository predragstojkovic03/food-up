import { Provider } from '@nestjs/common';
import { I_REPORT_ITEMS_REPOSITORY } from '../domain/report-items.repository.interface';
import { ReportItemsTypeOrmRepository } from './persistence/report-items-typeorm.repository';

export const ReportItemsRepositoryProvide: Provider = {
  provide: I_REPORT_ITEMS_REPOSITORY,
  useClass: ReportItemsTypeOrmRepository,
};

// UseCase providers removed. Only repository provider remains.
