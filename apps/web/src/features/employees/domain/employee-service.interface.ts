import {
  IBusinessInviteResponse,
  ICreateBusinessInvite,
  IEmployeeResponse,
  IUpdateEmployee,
  IUpdateEmployeeSelf,
} from '@food-up/shared';

export interface IEmployeeService {
  getByBusiness(businessId: string): Promise<IEmployeeResponse[]>;
  getMe(): Promise<IEmployeeResponse>;
  update(id: string, data: IUpdateEmployee): Promise<IEmployeeResponse>;
  updateSelf(data: IUpdateEmployeeSelf): Promise<IEmployeeResponse>;
  remove(id: string): Promise<void>;
  createInvite(businessId: string, data: ICreateBusinessInvite): Promise<IBusinessInviteResponse>;
}
