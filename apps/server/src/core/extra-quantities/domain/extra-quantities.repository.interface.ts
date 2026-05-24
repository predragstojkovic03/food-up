import { ExtraQuantity } from './extra-quantity.entity';

export const I_EXTRA_QUANTITIES_REPOSITORY = Symbol('IExtraQuantitiesRepository');

export interface IExtraQuantitiesRepository {
  insert(entity: ExtraQuantity): Promise<void>;
  findByWindow(windowId: string): Promise<ExtraQuantity[]>;
  remove(id: string): Promise<void>;
}
