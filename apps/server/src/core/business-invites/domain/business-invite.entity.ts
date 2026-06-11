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
    emailSentAt: Date | null,
  ): BusinessInvite {
    return new BusinessInvite(id, businessId, email, token, expiresAt, usedAt, emailSentAt);
  }

  private constructor(
    id: string,
    public readonly businessId: string,
    public readonly email: string,
    public readonly token: string,
    public readonly expiresAt: Date,
    public usedAt: Date | null,
    public emailSentAt: Date | null,
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

  get isActive(): boolean {
    return !this.isExpired && !this.isUsed;
  }

  get mailSent(): boolean {
    return this.emailSentAt !== null;
  }

  markEmailSent(): void {
    this.emailSentAt = new Date();
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
