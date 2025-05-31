export class User {
  private readonly _email: string;
  private readonly _name: string;

  constructor(email: string, name: string) {
    this._email = email;
    this._name = name;
  }

  public get email(): string {
    return this._email;
  }

  public get name(): string {
    return this._name;
  }
}
