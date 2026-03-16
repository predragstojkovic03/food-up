import { HttpClient } from '@/shared/infrastructure/http/http-client';
import {
  IBusinessOption,
  IBusinessService,
} from '../domain/business-service.interface';

export class BusinessService implements IBusinessService {
  constructor(private readonly http: HttpClient) {}

  findAll(): Promise<IBusinessOption[]> {
    return this.http.get<IBusinessOption[]>('/api/businesses');
  }
}
