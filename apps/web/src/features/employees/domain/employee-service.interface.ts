import {
  IBusinessInviteResponse,
  ICreateBusinessInvite,
  IEmployeeResponse,
  IUpdateEmployee,
} from '@food-up/shared';

export interface IEmployeeService {
  getByBusiness(businessId: string): Promise<IEmployeeResponse[]>;
  update(id: string, data: IUpdateEmployee): Promise<IEmployeeResponse>;
  remove(id: string): Promise<void>;
  createInvite(businessId: string, data: ICreateBusinessInvite): Promise<IBusinessInviteResponse>;
}
