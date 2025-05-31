import { IAuthService } from '@/features/auth/domain/auth-service.interface';

export interface ServiceContainer {
  authService: IAuthService;
}
