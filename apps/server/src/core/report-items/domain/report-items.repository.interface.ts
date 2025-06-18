import { IRepository } from 'src/shared/domain/repository.interface';
import { ReportItem } from './report-item.entity';

export const I_REPORT_ITEMS_REPOSITORY = Symbol('IReportItemsRepository');

export interface IReportItemsRepository extends IRepository<ReportItem> {}
