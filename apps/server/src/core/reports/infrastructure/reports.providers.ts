import { Provider } from '@nestjs/common';
import { I_REPORTS_REPOSITORY } from '../domain/reports.repository.interface';
import { ReportsTypeOrmRepository } from './persistence/reports-typeorm.repository';

export const ReportsRepositoryProvide: Provider = {
  provide: I_REPORTS_REPOSITORY,
  useClass: ReportsTypeOrmRepository,
};

// UseCase providers removed. Only repository provider remains.
