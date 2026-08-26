import { IdentityType } from '@food-up/shared';
import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { IdentityActiveStatusChangedEvent } from './events/identity-active-status-changed.event';

export class Identity extends Entity {
  static createWithPassword(
    email: string,
    passwordHash: string,
    type: IdentityType,
    isActive: boolean = true,
  ): Identity {
    return new Identity(generateId(), email, passwordHash, type, isActive, null);
  }

  static createWithGoogle(
    email: string,
    googleId: string,
    type: IdentityType,
  ): Identity {
    return new Identity(generateId(), email, null, type, true, googleId);
  }

  static reconstitute(
    id: string,
    email: string,
    passwordHash: string | null,
    type: IdentityType,
    isActive: boolean = true,
    googleId: string | null = null,
  ): Identity {
    return new Identity(id, email, passwordHash, type, isActive, googleId);
  }

  private constructor(
    id: string,
    email: string,
    passwordHash: string | null,
    type: IdentityType,
    isActive: boolean,
    googleId: string | null,
  ) {
    super();
    if (!passwordHash && !googleId) {
      throw new Error('Identity must have at least one authentication method');
    }
    this._id = id;
    this._email = email;
    this._passwordHash = passwordHash;
    this._type = type;
    this._isActive = isActive;
    this._googleId = googleId;
  }

  private readonly _id: string;
  private readonly _email: string;
  private _passwordHash: string | null;
  private readonly _type: IdentityType;
  private _isActive: boolean;
  private _googleId: string | null;

  get id(): string {
    return this._id;
  }

  get email(): string {
    return this._email;
  }

  get passwordHash(): string | null {
    return this._passwordHash;
  }

  get type(): IdentityType {
    return this._type;
  }

  get isActive(): boolean {
    return this._isActive;
  }

  get googleId(): string | null {
    return this._googleId;
  }

  set isActive(value: boolean) {
    this._isActive = value;
    this.addDomainEvent(new IdentityActiveStatusChangedEvent(this.id, value));
  }

  linkGoogle(googleId: string, clearPassword: boolean): void {
    this._googleId = googleId;
    if (clearPassword) {
      this._passwordHash = null;
    }
  }

  isPasswordValid(
    password: string,
    hashComparer: (password: string, hash: string) => Promise<boolean>,
  ): Promise<boolean> {
    if (!this._passwordHash) return Promise.resolve(false);
    return hashComparer(password, this._passwordHash);
  }
}
