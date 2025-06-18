import { IRepository } from 'src/shared/domain/repository.interface';
import { Report } from './report.entity';

export const I_REPORTS_REPOSITORY = Symbol('IReportsRepository');

export interface IReportsRepository extends IRepository<Report> {}
