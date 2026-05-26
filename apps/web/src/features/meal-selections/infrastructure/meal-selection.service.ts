import { HttpClient } from '@/shared/infrastructure/http/http-client';
import {
  ICreateMealSelection,
  IMealSelectionResponse,
  IMyMealSelectionResponse,
  IUpdateMealSelection,
  IWindowDailyOverviewItem,
} from '@food-up/shared';
import { IMealSelectionService } from '../domain/meal-selection-service.interface';

export class MealSelectionService implements IMealSelectionService {
  constructor(private readonly http: HttpClient) {}

  getByWindow(windowId: string): Promise<IMealSelectionResponse[]> {
    return this.http.get<IMealSelectionResponse[]>(`/api/meal-selections/window/${windowId}`);
  }

  getMySelectionsForWindow(windowId: string): Promise<IMyMealSelectionResponse[]> {
    return this.http.get<IMyMealSelectionResponse[]>(`/api/meal-selections/my/window/${windowId}`);
  }

  getDailyOverview(windowId: string): Promise<IWindowDailyOverviewItem[]> {
    return this.http.get<IWindowDailyOverviewItem[]>(
      `/api/meal-selections/window/${windowId}/daily-overview`,
    );
  }

  create(data: ICreateMealSelection): Promise<IMealSelectionResponse> {
    return this.http.post<ICreateMealSelection, IMealSelectionResponse>('/api/meal-selections', data);
  }

  update(id: string, data: IUpdateMealSelection): Promise<IMealSelectionResponse> {
    return this.http.patch<IUpdateMealSelection, IMealSelectionResponse>(`/api/meal-selections/${id}`, data);
  }
}
