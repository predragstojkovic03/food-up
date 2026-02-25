import { Role } from '@/shared/domain/role.enum';

export class User {
  private readonly _email: string;
  private readonly _name: string;
  private readonly _role: Role;

  constructor(email: string, name: string, role: Role) {
    this._email = email;
    this._name = name;
    this._role = role;
  }

  public get email(): string {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }

  public get role(): Role {
    return this._role;
  }
}
