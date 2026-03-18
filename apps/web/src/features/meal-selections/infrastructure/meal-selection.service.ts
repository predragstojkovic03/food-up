import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IMealSelectionResponse } from '@food-up/shared';
import { IMealSelectionService } from '../domain/meal-selection-service.interface';

export class MealSelectionService implements IMealSelectionService {
  constructor(private readonly http: HttpClient) {}

  getByWindow(windowId: string): Promise<IMealSelectionResponse[]> {
    return this.http.get<IMealSelectionResponse[]>(`/api/meal-selections/window/${windowId}`);
  }
}
