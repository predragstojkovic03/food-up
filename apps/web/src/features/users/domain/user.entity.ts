import { EmployeeRole, IdentityType } from '@food-up/shared';

export class User {
  static reconstitute(
    id: string,
    type: IdentityType,
    role?: EmployeeRole,
    businessId?: string,
    pictureUrl?: string | null,
    hasPassword?: boolean,
  ): User {
    return new User(id, type, role, businessId, pictureUrl ?? null, hasPassword ?? true);
  }

  private constructor(
    public readonly id: string,
    public readonly type: IdentityType,
    public readonly role: EmployeeRole | undefined,
    public readonly businessId: string | undefined,
    public readonly pictureUrl: string | null,
    public readonly hasPassword: boolean,
  ) {}
}
