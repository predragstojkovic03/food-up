import { EmployeeRole, IdentityType } from '@food-up/shared';

export class User {
  static reconstitute(
    id: string,
    type: IdentityType,
    role?: EmployeeRole,
  ): User {
    return new User(id, type, role);
  }

  private constructor(
    public readonly id: string,
    public readonly type: IdentityType,
    public readonly role: EmployeeRole | undefined,
  ) {}
}
