import { User } from '@/features/users/domain/user.entity';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { tokenStore } from '@/shared/infrastructure/auth/token-store';
import { IAuthResponse, IChangePassword, ILogin, IMeResponse } from '@food-up/shared';
import {
  IAuthService,
  IRegisterEmployee,
  IRegisterSupplier,
} from '../domain/auth-service.interface';

export class AuthService implements IAuthService {
  constructor(private readonly http: HttpClient) {}

  async login(email: string, password: string): Promise<User> {
    const { access_token } = await this.http.post<ILogin, IAuthResponse>(
      '/api/auth/login',
      { email, password },
    );

    // Store in memory only — never in localStorage.
    // The server sets the refresh token as an httpOnly cookie automatically.
    tokenStore.set(access_token);

    const { id, type, role, businessId } = await this.http.get<IMeResponse>('/api/auth/me');
    return User.reconstitute(id, type, role, businessId);
  }

  async logout(): Promise<void> {
    // Tell the server to revoke the refresh token (reads the httpOnly cookie server-side)
    try {
      await this.http.post('/api/auth/logout', {});
    } finally {
      // Always clear memory even if the server call fails
      tokenStore.clear();
    }
  }

  async registerEmployee(data: IRegisterEmployee): Promise<void> {
    await this.http.post('/api/employees/register', data);
  }

  async registerSupplier(data: IRegisterSupplier): Promise<void> {
    await this.http.post('/api/suppliers/register', data);
  }

  async validateInvite(token: string): Promise<string | null> {
    const result = await this.http.get<{ email: string } | null>(
      `/api/businesses/invites/validate?token=${encodeURIComponent(token)}`,
    );
    return result?.email ?? null;
  }

  /**
   * Called on app mount to restore the session from the httpOnly refresh cookie.
   *
   * WHY no localStorage check: there's nothing in localStorage anymore. The access
   * token is in memory (cleared on refresh/close). The refresh cookie is httpOnly and
   * the browser attaches it automatically.
   *
   * Flow: GET /auth/me → 401 → HttpClient fires /auth/refresh (with cookie) → new
   * access token stored in memory → retry /auth/me → returns user. All transparent.
   */
  async changePassword(data: IChangePassword): Promise<void> {
    await this.http.post<IChangePassword, void>('/api/auth/change-password', data);
  }

  async restoreSession(): Promise<User | null> {
    try {
      const { id, type, role, businessId } = await this.http.get<IMeResponse>('/api/auth/me');
      return User.reconstitute(id, type, role, businessId);
    } catch {
      return null;
    }
  }
}
