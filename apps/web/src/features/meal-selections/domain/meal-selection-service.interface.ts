import { IMealSelectionResponse } from '@food-up/shared';

export interface IMealSelectionService {
  getByWindow(windowId: string): Promise<IMealSelectionResponse[]>;
}
