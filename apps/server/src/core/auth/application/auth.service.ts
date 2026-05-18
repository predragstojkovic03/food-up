import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { randomBytes } from 'crypto';
import { EmployeesService } from 'src/core/employees/application/employees.service';
import { Identity } from 'src/core/identity/domain/identity.entity';
import { IdentityService } from 'src/core/identity/application/identity.service';
import { EnvironmentVariables } from 'src/env.validation';
import {
  I_CONFIG_SERVICE,
  IConfigService,
} from 'src/shared/application/config-service.interface';
import { generateId } from 'src/shared/domain/generate-id';
import { IdentityType, EmployeeRole } from '@food-up/shared';
import {
  I_REFRESH_TOKEN_REPOSITORY,
  IRefreshTokenRepository,
  RefreshTokenRecord,
} from '../domain/refresh-token.repository.interface';
import { JwtPayload } from '../infrastructure/jwt-payload';

export interface IssuedSession {
  accessToken: string;
  rawRefreshToken: string;
  payload: JwtPayload;
}

@Injectable()
export class AuthService {
  constructor(
    @Inject(I_REFRESH_TOKEN_REPOSITORY)
    private readonly _rtRepo: IRefreshTokenRepository,
    private readonly _identityService: IdentityService,
    private readonly _employeesService: EmployeesService,
    private readonly _jwtService: JwtService,
    @Inject(I_CONFIG_SERVICE)
    private readonly _config: IConfigService<EnvironmentVariables, true>,
  ) {}

  /**
   * Validates email/password credentials. Returns the Identity on success, null on failure.
   * Called by LocalStrategy — keeps the controller strategy-agnostic.
   */
  async validateLocalCredentials(email: string, password: string): Promise<Identity | null> {
    try {
      return await this._identityService.validateCredentials(email, password);
    } catch {
      return null;
    }
  }

  /**
   * Single entry point for ALL auth strategies (local, Google, SAML, …) after the identity
   * has been resolved. Issues a short-lived access JWT and a long-lived refresh token.
   *
   * WHY one method for all strategies: every auth mechanism resolves to an Identity and needs
   * tokens. Centralising issuance here means adding Google OAuth never touches token logic.
   */
  async issueSessionForIdentity(identityId: string): Promise<IssuedSession> {
    const payload = await this._buildJwtPayload(identityId);
    const accessToken = await this._signAccessToken(payload);
    const rawRefreshToken = await this._issueRefreshToken(identityId);
    return { accessToken, rawRefreshToken, payload };
  }

  /**
   * Validates an inbound refresh cookie, detects reuse (token theft), rotates to a new token,
   * and returns a fresh access token + new refresh token in the same family.
   *
   * WHY reuse detection: if a stolen refresh token was used by a thief before the victim
   * tries to refresh, presenting the already-consumed token again is detectable. We respond
   * by revoking the entire family — the thief's rotated copy is also dead.
   */
  async refreshSession(rawCookieToken: string): Promise<{ accessToken: string; rawRefreshToken: string }> {
    const { tokenId, secret } = this._parseCookieToken(rawCookieToken);
    const record = await this._rtRepo.findById(tokenId);

    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    const secretMatches = await compare(secret, record.secretHash);
    if (!secretMatches) {
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    if (record.isRevoked) {
      throw new UnauthorizedException('Session has been revoked');
    }

    if (record.usedAt !== null) {
      // A previously consumed token was re-presented — classic theft signal.
      // Revoke the whole family so any token the thief already rotated is also dead.
      await this._rtRepo.revokeFamily(record.familyId);
      throw new UnauthorizedException('Token reuse detected — session revoked');
    }

    // Consume the current token before issuing the next one in the chain
    await this._rtRepo.markUsed(record.id, new Date());

    const payload = await this._buildJwtPayload(record.identityId);
    const accessToken = await this._signAccessToken(payload);
    // Carry the familyId forward — all rotations belong to the same login session
    const rawRefreshToken = await this._issueRefreshToken(record.identityId, record.familyId);

    return { accessToken, rawRefreshToken };
  }

  /**
   * Revokes the refresh token associated with the cookie, ending the session.
   * Gracefully no-ops if the cookie is absent or the token is already gone.
   */
  async revokeSession(rawCookieToken: string | undefined): Promise<void> {
    if (!rawCookieToken) return;

    try {
      const { tokenId, secret } = this._parseCookieToken(rawCookieToken);
      const record = await this._rtRepo.findById(tokenId);
      if (!record) return;

      const secretMatches = await compare(secret, record.secretHash);
      if (!secretMatches) return;

      await this._rtRepo.revoke(record.id);
    } catch {
      // Best-effort logout — never block the response on token parsing failures
    }
  }

  private async _buildJwtPayload(identityId: string): Promise<JwtPayload> {
    const identity = await this._identityService.findById(identityId);
    if (!identity) throw new UnauthorizedException('Identity not found');

    let role: EmployeeRole | undefined;
    if (identity.type === IdentityType.Employee) {
      const employee = await this._employeesService.findByIdentity(identityId);
      if (!employee) throw new UnauthorizedException('Employee not found');
      role = employee.role;
    }

    return { sub: identityId, type: identity.type, role };
  }

  private _signAccessToken(payload: JwtPayload): Promise<string> {
    return this._jwtService.signAsync(payload, {
      expiresIn: this._config.get('JWT_ACCESS_EXPIRY'),
    });
  }

  /**
   * Builds a RefreshTokenRecord inline and persists its bcrypt-hashed secret.
   *
   * Cookie format: base64url(`${tokenId}:${rawSecret}`)
   * - tokenId  → the DB record PK (ULID) — O(1) lookup, no full-table scan
   * - rawSecret → 32 random bytes hex — bcrypt-hashed so a DB breach yields nothing usable
   */
  private async _issueRefreshToken(identityId: string, familyId?: string): Promise<string> {
    const rawSecret = randomBytes(32).toString('hex');
    const secretHash = await hash(rawSecret, 10);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this._config.get('JWT_REFRESH_EXPIRY_DAYS'));

    const record: RefreshTokenRecord = {
      id: generateId(),
      identityId,
      familyId: familyId ?? generateId(),
      secretHash,
      expiresAt,
      usedAt: null,
      isRevoked: false,
      createdAt: new Date(),
    };

    await this._rtRepo.create(record);
    return this._buildCookieToken(record.id, rawSecret);
  }

  private _buildCookieToken(tokenId: string, secret: string): string {
    return Buffer.from(`${tokenId}:${secret}`).toString('base64url');
  }

  private _parseCookieToken(raw: string): { tokenId: string; secret: string } {
    const decoded = Buffer.from(raw, 'base64url').toString();
    const colonIndex = decoded.indexOf(':');
    if (colonIndex === -1) throw new UnauthorizedException('Malformed refresh token');
    return {
      tokenId: decoded.slice(0, colonIndex),
      secret: decoded.slice(colonIndex + 1),
    };
  }
}
