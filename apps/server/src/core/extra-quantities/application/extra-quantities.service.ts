import { Inject, Injectable } from '@nestjs/common';
import { MealSelectionWindowsService } from 'src/core/meal-selection-windows/application/meal-selection-windows.service';
import { MenuItemsService } from 'src/core/menu-items/application/menu-items.service';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from 'src/shared/domain/exceptions/invalid-input-data.exception';
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
    private readonly _windowsService: MealSelectionWindowsService,
    private readonly _menuItemsService: MenuItemsService,
  ) {}

  async add(
    windowId: string,
    menuItemId: string,
    quantity: number,
    guestName: string | null,
    identityId: string,
  ): Promise<ExtraQuantity> {
    const [window, menuItem] = await Promise.all([
      this._windowsService.findOneInMyBusiness(windowId, identityId),
      this._menuItemsService.findOne(menuItemId),
    ]);

    if (!window.menuPeriodIds.includes(menuItem.menuPeriodId)) {
      throw new InvalidInputDataException(
        `Menu item ${menuItemId} does not belong to any menu period of window ${windowId}`,
      );
    }

    const entity = ExtraQuantity.create(windowId, menuItemId, quantity, guestName);
    await this._repository.insert(entity);
    return entity;
  }

  async findByWindow(windowId: string, identityId: string): Promise<ExtraQuantity[]> {
    await this._windowsService.findOneInMyBusiness(windowId, identityId);
    return this._repository.findByWindow(windowId);
  }

  async remove(id: string, identityId: string): Promise<void> {
    const entity = await this._repository.findById(id);
    if (!entity) {
      throw new EntityInstanceNotFoundException(`Extra quantity ${id} not found`);
    }
    await this._windowsService.findOneInMyBusiness(entity.windowId, identityId);
    return this._repository.remove(id);
  }
}
