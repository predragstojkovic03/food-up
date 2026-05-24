import { Inject, Injectable } from '@nestjs/common';
import { ExtraQuantity } from '../domain/extra-quantity.entity';
import {
  I_EXTRA_QUANTITIES_REPOSITORY,
  IExtraQuantitiesRepository,
} from '../domain/extra-quantities.repository.interface';

@Injectable()
export class ExtraQuantitiesService {
  constructor(
    @Inject(I_EXTRA_QUANTITIES_REPOSITORY)
    private readonly _repository: IExtraQuantitiesRepository,
  ) {}

  async add(
    windowId: string,
    menuItemId: string,
    quantity: number,
    guestName: string | null,
  ): Promise<ExtraQuantity> {
    const entity = ExtraQuantity.create(windowId, menuItemId, quantity, guestName);
    await this._repository.insert(entity);
    return entity;
  }

  async findByWindow(windowId: string): Promise<ExtraQuantity[]> {
    return this._repository.findByWindow(windowId);
  }

  async remove(id: string): Promise<void> {
    return this._repository.remove(id);
  }
}
