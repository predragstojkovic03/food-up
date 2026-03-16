import { EmployeeRole } from '../enums/employee-role.enum';
import { IdentityType } from '../enums/identity-type.enum';

export interface ILogin {
  email: string;
  password: string;
}

export interface IAuthResponse {
  access_token: string;
}

export interface IMeResponse {
  id: string;
  type: IdentityType;
  role?: EmployeeRole;
}
