import { EmployeeRole, IdentityType } from '@food-up/shared';

export class User {
  static reconstitute(
    id: string,
    type: IdentityType,
    role?: EmployeeRole,
    businessId?: string,
  ): User {
    return new User(id, type, role, businessId);
  }

  private constructor(
    public readonly id: string,
    public readonly type: IdentityType,
    public readonly role: EmployeeRole | undefined,
    public readonly businessId: string | undefined,
  ) {}
}
