import { IEvent } from 'src/shared/domain/event.interface';

export class ChangeRequestApprovedEvent implements IEvent {
  name: string = 'changeRequest.approved';

  constructor(
    public readonly changeRequestId: string,
    public readonly mealSelectionId: string | undefined,
    public readonly newMenuItemId: string | null,
    public readonly newQuantity: number | null,
    public readonly clearSelection: boolean,
  ) {}
}
