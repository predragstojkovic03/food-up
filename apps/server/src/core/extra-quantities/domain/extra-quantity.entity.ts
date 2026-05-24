import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';

export class ExtraQuantity extends Entity {
  private constructor(
    private readonly _id: string,
    private readonly _windowId: string,
    private readonly _menuItemId: string,
    private readonly _quantity: number,
    private readonly _guestName: string | null,
  ) {
    super();
  }

  static create(
    windowId: string,
    menuItemId: string,
    quantity: number,
    guestName: string | null,
  ): ExtraQuantity {
    return new ExtraQuantity(generateId(), windowId, menuItemId, quantity, guestName);
  }

  static reconstitute(
    id: string,
    windowId: string,
    menuItemId: string,
    quantity: number,
    guestName: string | null,
  ): ExtraQuantity {
    return new ExtraQuantity(id, windowId, menuItemId, quantity, guestName);
  }

  get id(): string { return this._id; }
  get windowId(): string { return this._windowId; }
  get menuItemId(): string { return this._menuItemId; }
  get quantity(): number { return this._quantity; }
  get guestName(): string | null { return this._guestName; }
}
