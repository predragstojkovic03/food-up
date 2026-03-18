import { HttpClient } from '@/shared/infrastructure/http/http-client';
import {
  ICreateMealSelectionWindow,
  IGetCurrentMealSelectionWindowResponse,
  IMealSelectionWindowResponse,
  IUpdateMealSelectionWindow,
  IWindowMenuItemResponse,
} from '@food-up/shared';
import { IMealSelectionWindowService } from '../domain/meal-selection-window-service.interface';

export class MealSelectionWindowService implements IMealSelectionWindowService {
  constructor(private readonly http: HttpClient) {}

  getForMyBusiness(): Promise<IMealSelectionWindowResponse[]> {
    return this.http.get<IMealSelectionWindowResponse[]>('/api/meal-selection-windows/business');
  }

  getCurrent(): Promise<IGetCurrentMealSelectionWindowResponse> {
    return this.http.get<IGetCurrentMealSelectionWindowResponse>('/api/meal-selection-windows/current');
  }

  create(data: ICreateMealSelectionWindow): Promise<IMealSelectionWindowResponse> {
    return this.http.post<ICreateMealSelectionWindow, IMealSelectionWindowResponse>(
      '/api/meal-selection-windows',
      data,
    );
  }

  update(id: string, data: IUpdateMealSelectionWindow): Promise<IMealSelectionWindowResponse> {
    return this.http.patch<IUpdateMealSelectionWindow, IMealSelectionWindowResponse>(
      `/api/meal-selection-windows/${id}`,
      data,
    );
  }

  getMenuItems(windowId: string): Promise<IWindowMenuItemResponse[]> {
    return this.http.get<IWindowMenuItemResponse[]>(`/api/meal-selection-windows/${windowId}/menu-items`);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/api/meal-selection-windows/${id}`);
  }
}
