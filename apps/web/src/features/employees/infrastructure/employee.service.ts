import {
  IBusinessInviteResponse,
  ICreateBusinessInvite,
  IEmployeeResponse,
  IUpdateEmployee,
  IUpdateEmployeeSelf,
} from '@food-up/shared';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IEmployeeService } from '../domain/employee-service.interface';

export class EmployeeService implements IEmployeeService {
  constructor(private readonly http: HttpClient) {}

  getByBusiness(businessId: string): Promise<IEmployeeResponse[]> {
    return this.http.get<IEmployeeResponse[]>(`/api/employees/business/${businessId}`);
  }

  getMe(): Promise<IEmployeeResponse> {
    return this.http.get<IEmployeeResponse>('/api/employees/me');
  }

  update(id: string, data: IUpdateEmployee): Promise<IEmployeeResponse> {
    return this.http.patch<IUpdateEmployee, IEmployeeResponse>(`/api/employees/${id}`, data);
  }

  updateSelf(data: IUpdateEmployeeSelf): Promise<IEmployeeResponse> {
    return this.http.patch<IUpdateEmployeeSelf, IEmployeeResponse>('/api/employees/me', data);
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

  getInvites(businessId: string): Promise<IBusinessInviteResponse[]> {
    return this.http.get<IBusinessInviteResponse[]>(`/api/businesses/${businessId}/invites`);
  }

  resendInvite(businessId: string, inviteId: string): Promise<IBusinessInviteResponse> {
    return this.http.post<Record<string, never>, IBusinessInviteResponse>(
      `/api/businesses/${businessId}/invites/${inviteId}/resend`,
      {},
    );
  }
}
