import { Expose } from 'class-transformer';

export class BusinessResponseDto {
  @Expose() id: string;
  @Expose() name: string;
  @Expose() contactEmail: string;
}
