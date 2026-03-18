import { EmployeeRole } from '@food-up/shared';

export interface EmployeeView {
  id: string;
  name: string;
  role: EmployeeRole;
  businessId: string;
  identityId: string;
  email: string;
  isActive: boolean;
}
