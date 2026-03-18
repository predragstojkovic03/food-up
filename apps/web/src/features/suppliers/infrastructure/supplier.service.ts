import { HttpClient } from '@/shared/infrastructure/http/http-client';
import {
  ICreateManagedSupplier,
  ISupplierResponse,
  IUpdateSupplier,
} from '@food-up/shared';
import { ISupplierService } from '../domain/supplier-service.interface';

export class SupplierService implements ISupplierService {
  constructor(private readonly http: HttpClient) {}

  getManagedByBusiness(): Promise<ISupplierResponse[]> {
    return this.http.get<ISupplierResponse[]>('/api/suppliers/managed');
  }

  getPartnersByBusiness(): Promise<ISupplierResponse[]> {
    return this.http.get<ISupplierResponse[]>('/api/suppliers/partners');
  }

  createManaged(data: ICreateManagedSupplier): Promise<ISupplierResponse> {
    return this.http.post<ICreateManagedSupplier, ISupplierResponse>(
      '/api/suppliers/managed',
      data,
    );
  }

  update(id: string, data: IUpdateSupplier): Promise<ISupplierResponse> {
    return this.http.patch<IUpdateSupplier, ISupplierResponse>(
      `/api/suppliers/${id}`,
      data,
    );
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/api/suppliers/${id}`);
  }
}
