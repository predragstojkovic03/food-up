import { IRepository } from 'src/shared/domain/repository.interface';
import { MenuPeriod } from './menu-period.entity';

export const I_MENU_PERIODS_REPOSITORY = Symbol('IMenuPeriodsRepository');

export interface IMenuPeriodsRepository extends IRepository<MenuPeriod> {}
