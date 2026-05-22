import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IUpdateBusinessLanguage } from '@food-up/shared';
import {
  IBusinessOption,
  IBusinessService,
} from '../domain/business-service.interface';

export class BusinessService implements IBusinessService {
  constructor(private readonly http: HttpClient) {}

  findAll(): Promise<IBusinessOption[]> {
    return this.http.get<IBusinessOption[]>('/api/businesses');
  }

  updateLanguage(data: IUpdateBusinessLanguage): Promise<void> {
    return this.http.patch<IUpdateBusinessLanguage, void>('/api/businesses/my', data);
  }
}
