import { IExtraQuantity } from '@food-up/shared';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IExtraQuantityService } from '../domain/extra-quantity-service.interface';

export class ExtraQuantityService implements IExtraQuantityService {
  constructor(private readonly http: HttpClient) {}

  getByWindow(windowId: string): Promise<IExtraQuantity[]> {
    return this.http.get<IExtraQuantity[]>(`/api/extra-quantities?windowId=${windowId}`);
  }

  add(data: {
    windowId: string;
    menuItemId: string;
    quantity: number;
    guestName?: string;
  }): Promise<IExtraQuantity> {
    return this.http.post<typeof data, IExtraQuantity>('/api/extra-quantities', data);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/api/extra-quantities/${id}`);
  }
}
