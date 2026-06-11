import { EmployeeRole } from '../enums/employee-role.enum';

export interface IEmployeeResponse {
  id: string;
  name: string;
  role: EmployeeRole;
  businessId: string;
  identityId: string;
  email: string;
  isActive: boolean;
}

export interface IUpdateEmployee {
  name?: string;
  role?: EmployeeRole;
  isActive?: boolean;
}

export interface IUpdateEmployeeSelf {
  name: string;
}

export interface ICreateBusinessInvite {
  email: string;
}

export interface IBusinessInviteResponse {
  id: string;
  token: string;
  email: string;
  expiresAt: string;
  mailSent: boolean;
}
