import { EmployeeRole, IdentityType } from '@food-up/shared';

export function getRedirectPath(type: IdentityType, role?: EmployeeRole): string {
  switch (type) {
    case IdentityType.Employee:
      return role === EmployeeRole.Manager ? '/employee/manager' : '/employee';
    case IdentityType.Supplier:
      return '/supplier';
    case IdentityType.Business:
      return '/business';
    case IdentityType.Admin:
      return '/admin';
  }
}
