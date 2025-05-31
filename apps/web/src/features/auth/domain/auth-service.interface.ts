import { User } from '../../../shared/types/user.type';

export interface IAuthService {
  login(email: string, password: string): Promise<User>;
  logout(): Promise<void>;
}
