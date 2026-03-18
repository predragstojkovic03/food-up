import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { ICreateMeal, IMealResponse, IUpdateMeal } from '@food-up/shared';
import { IMealService } from '../domain/meal-service.interface';

export class MealService implements IMealService {
  constructor(private readonly http: HttpClient) {}

  getBySupplier(supplierId: string): Promise<IMealResponse[]> {
    return this.http.get<IMealResponse[]>(`/api/meals/supplier/${supplierId}`);
  }

  create(data: ICreateMeal): Promise<IMealResponse> {
    return this.http.post<ICreateMeal, IMealResponse>('/api/meals', data);
  }

  update(id: string, data: IUpdateMeal): Promise<IMealResponse> {
    return this.http.patch<IUpdateMeal, IMealResponse>(`/api/meals/${id}`, data);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/api/meals/${id}`);
  }
}
