import { Entity } from 'src/shared/domain/entity';
import { generateId } from 'src/shared/domain/generate-id';
import { InvalidOperationException } from 'src/shared/domain/exceptions/invalid-operation.exception';

export class BusinessInvite extends Entity {
  static create(businessId: string, email: string, expiresAt: Date): BusinessInvite {
    return new BusinessInvite(
      generateId(),
      businessId,
      email,
      crypto.randomUUID(),
      expiresAt,
      null,
    );
  }

  static reconstitute(
    id: string,
    businessId: string,
    email: string,
    token: string,
    expiresAt: Date,
    usedAt: Date | null,
  ): BusinessInvite {
    return new BusinessInvite(id, businessId, email, token, expiresAt, usedAt);
  }

  private constructor(
    id: string,
    public readonly businessId: string,
    public readonly email: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public usedAt: Date | null,
  ) {
    super();
    this.id = id;
  }

  get isExpired(): boolean {
    return new Date() > this.expiresAt;
  }

  get isUsed(): boolean {
    return this.usedAt !== null;
  }

  consume(): void {
    if (this.isExpired) {
      throw new InvalidOperationException('Invite link has expired.');
    }
    if (this.isUsed) {
      throw new InvalidOperationException('Invite link has already been used.');
    }
    this.usedAt = new Date();
  }

  readonly id: string;
}
