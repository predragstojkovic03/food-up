import { Expose } from 'class-transformer';

@Expose()
export class EmployeeResponseDto {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
  businessId: string;
}
