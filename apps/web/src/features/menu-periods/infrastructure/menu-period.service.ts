import { HttpClient } from '@/shared/infrastructure/http/http-client';
import {
  ICreateMenuPeriod,
  IMenuPeriodResponse,
  IUpdateMenuPeriod,
} from '@food-up/shared';
import { IMenuPeriodService } from '../domain/menu-period-service.interface';

export class MenuPeriodService implements IMenuPeriodService {
  constructor(private readonly http: HttpClient) {}

  getBySupplier(supplierId: string): Promise<IMenuPeriodResponse[]> {
    return this.http.get<IMenuPeriodResponse[]>(
      `/api/menu-periods/supplier/${supplierId}`,
    );
  }

  create(data: ICreateMenuPeriod): Promise<IMenuPeriodResponse> {
    return this.http.post<ICreateMenuPeriod, IMenuPeriodResponse>(
      '/api/menu-periods',
      data,
    );
  }

  update(id: string, data: IUpdateMenuPeriod): Promise<IMenuPeriodResponse> {
    return this.http.patch<IUpdateMenuPeriod, IMenuPeriodResponse>(
      `/api/menu-periods/${id}`,
      data,
    );
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/api/menu-periods/${id}`);
  }
}
