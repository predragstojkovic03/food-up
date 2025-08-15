export type IdentityType = 'employee' | 'supplier' | 'business';

export class Identity {
  constructor(
    public readonly id: string,
    public email: string,
    public passwordHash: string,
    public type: IdentityType,
    public isActive: boolean = true,
  ) {}

  isPasswordValid(
    password: string,
    hashComparer: (password: string, hash: string) => Promise<boolean>,
  ): Promise<boolean> {
    return hashComparer(password, this.passwordHash);
  }
}
