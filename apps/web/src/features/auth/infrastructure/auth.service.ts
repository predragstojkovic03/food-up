import { User } from '@/shared/types/user.type';
import { IAuthService } from '../domain/auth-service.interface';

export class AuthService implements IAuthService {
  async login(email: string, password: string): Promise<User> {
    const res = await fetch('/api/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) throw new Error('Login failed');
    return res.json();
  }

  async logout(): Promise<void> {
    await fetch('/api/logout', { method: 'POST' });
  }
}
