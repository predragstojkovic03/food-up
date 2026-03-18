import { User } from '@/features/users/domain/user.entity';

export interface IRegisterEmployee {
  name: string;
  email: string;
  password: string;
  inviteToken: string;
}

export interface IRegisterSupplier {
  name: string;
  email: string;
  password: string;
  contactInfo: string;
}

export interface IAuthService {
  login(email: string, password: string): Promise<User>;
  logout(): void;
  registerEmployee(data: IRegisterEmployee): Promise<void>;
  registerSupplier(data: IRegisterSupplier): Promise<void>;
  restoreSession(): Promise<User | null>;
  validateInvite(token: string): Promise<string | null>;
}
