export const I_REFRESH_TOKEN_REPOSITORY = Symbol('IRefreshTokenRepository');

export interface RefreshTokenRecord {
  id: string;
  identityId: string;
  familyId: string;
  secretHash: string;
  expiresAt: Date;
  usedAt: Date | null;
  isRevoked: boolean;
  createdAt: Date;
}

export interface IRefreshTokenRepository {
  create(token: RefreshTokenRecord): Promise<void>;
  findById(id: string): Promise<RefreshTokenRecord | null>;
  markUsed(id: string, usedAt: Date): Promise<void>;
  revokeFamily(familyId: string): Promise<void>;
  revoke(id: string): Promise<void>;
}
