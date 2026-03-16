import { IAuthService } from '@/features/auth/domain/auth-service.interface';
import { IBusinessService } from '@/features/businesses/domain/business-service.interface';

export interface ServiceContainer {
  authService: IAuthService;
  businessService: IBusinessService;
}
