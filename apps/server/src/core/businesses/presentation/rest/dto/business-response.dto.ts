import { Expose } from 'class-transformer';

@Expose()
export class BusinessResponseDto {
  id: string;
  name: string;
  contactEmail: string;
}
