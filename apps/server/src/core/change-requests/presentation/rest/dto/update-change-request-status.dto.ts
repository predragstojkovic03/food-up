import { IsEnum } from 'class-validator';
import { ChangeRequestStatus } from 'src/core/change-requests/domain/change-request-status.enum';

export class UpdateChangeRequestStatusDto {
  @IsEnum(ChangeRequestStatus)
  status: ChangeRequestStatus;
}
