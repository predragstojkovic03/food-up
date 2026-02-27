import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { IdentityActiveStatusChangedEvent } from './events/identity-active-status-changed.event';

export enum IdentityType {
  Employee = 'employee',
  Supplier = 'supplier',
  Business = 'business',
  Admin = 'admin',
}

export class Identity extends Entity {
  static create(
    email: string,
    passwordHash: string,
    type: IdentityType,
    isActive: boolean = true,
  ): Identity {
    return new Identity(generateId(), email, passwordHash, type, isActive);
  }

  static reconstitute(
    id: string,
    email: string,
    passwordHash: string,
    type: IdentityType,
    isActive: boolean = true,
  ): Identity {
    return new Identity(id, email, passwordHash, type, isActive);
  }

  private constructor(
    id: string,
    email: string,
    passwordHash: string,
    type: IdentityType,
    isActive: boolean = true,
  ) {
    super();
    this._id = id;
    this._email = email;
    this._passwordHash = passwordHash;
    this._type = type;
    this._isActive = isActive;
  }

  private readonly _id: string;
  private readonly _email: string;
  private readonly _passwordHash: string;
  private readonly _type: IdentityType;
  private _isActive: boolean;

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string {
    return this._passwordHash;
  }

  get type(): IdentityType {
    return this._type;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  set isActive(value: boolean) {
    this._isActive = value;
    this.addDomainEvent(new IdentityActiveStatusChangedEvent(this.id, value));
  }

  isPasswordValid(
    password: string,
    hashComparer: (password: string, hash: string) => Promise<boolean>,
  ): Promise<boolean> {
    return hashComparer(password, this.passwordHash);
  }
}
