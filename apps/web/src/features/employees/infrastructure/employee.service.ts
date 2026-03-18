import {
  IBusinessInviteResponse,
  ICreateBusinessInvite,
  IEmployeeResponse,
  IUpdateEmployee,
} from '@food-up/shared';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IEmployeeService } from '../domain/employee-service.interface';

export class EmployeeService implements IEmployeeService {
  constructor(private readonly http: HttpClient) {}

  getByBusiness(businessId: string): Promise<IEmployeeResponse[]> {
    return this.http.get<IEmployeeResponse[]>(`/api/employees/business/${businessId}`);
  }

  update(id: string, data: IUpdateEmployee): Promise<IEmployeeResponse> {
    return this.http.patch<IUpdateEmployee, IEmployeeResponse>(`/api/employees/${id}`, data);
  }

  remove(id: string): Promise<void> {
    return this.http.delete(`/api/employees/${id}`);
  }

  createInvite(businessId: string, data: ICreateBusinessInvite): Promise<IBusinessInviteResponse> {
    return this.http.post<ICreateBusinessInvite, IBusinessInviteResponse>(
      `/api/businesses/${businessId}/invites`,
      data,
    );
  }
}
