import { User } from '@/features/users/domain/user.entity';
import { HttpClient } from '@/shared/infrastructure/http/http-client';
import { IAuthResponse, ILogin, IMeResponse } from '@food-up/shared';
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

    localStorage.setItem('access_token', access_token);

    const { id, type, role } = await this.http.get<IMeResponse>('/api/auth/me');

    return User.reconstitute(id, type, role);
  }

  async logout(): Promise<void> {
    await this.http.post('/api/auth/logout', {});
    localStorage.removeItem('access_token');
  }

  async registerEmployee(data: IRegisterEmployee): Promise<void> {
    await this.http.post('/api/employees/register', data);
  }

  async registerSupplier(data: IRegisterSupplier): Promise<void> {
    await this.http.post('/api/suppliers/register', data);
  }

  async validateInvite(token: string): Promise<string | null> {
    const result = await this.http.get<{ email: string } | null>(`/api/businesses/invites/validate?token=${encodeURIComponent(token)}`);
    return result?.email ?? null;
  }

  async restoreSession(): Promise<User | null> {
    if (!localStorage.getItem('access_token')) return null;

    try {
      const { id, type, role } = await this.http.get<IMeResponse>('/api/auth/me');
      return User.reconstitute(id, type, role);
    } catch {
      localStorage.removeItem('access_token');
      return null;
    }
  }
}
