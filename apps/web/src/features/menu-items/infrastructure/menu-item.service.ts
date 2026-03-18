import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { ICreateMenuItem, IMenuItemResponse } from '@food-up/shared';
import { IMenuItemService } from '../domain/menu-item-service.interface';

export class MenuItemService implements IMenuItemService {
  constructor(private readonly http: HttpClient) {}

  getByMenuPeriod(menuPeriodId: string): Promise<IMenuItemResponse[]> {
    return this.http.get<IMenuItemResponse[]>(
      `/api/menu-items/menu-period/${menuPeriodId}`,
    );
  }

  create(data: ICreateMenuItem): Promise<IMenuItemResponse> {
    return this.http.post<ICreateMenuItem, IMenuItemResponse>(
      '/api/menu-items',
      data,
    );
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/api/menu-items/${id}`);
  }
}
