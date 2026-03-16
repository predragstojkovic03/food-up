import { IsEnum } from 'class-validator';
import { ChangeRequestStatus } from '@food-up/shared';

export class UpdateChangeRequestStatusDto {
  @IsEnum(ChangeRequestStatus)
  status: ChangeRequestStatus;
}
