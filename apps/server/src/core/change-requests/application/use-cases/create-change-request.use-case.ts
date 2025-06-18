import { ulid } from 'ulid';
import { ChangeRequest } from '../../domain/change-request.entity';
import { IChangeRequestsRepository } from '../../domain/change-requests.repository.interface';

export interface CreateChangeRequestDto {
  employeeId: string;
  mealSelectionId: string;
  newMenuItemId: string;
  newQuantity?: number | null;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | null;
  approvedAt?: Date | null;
}

export class CreateChangeRequestUseCase {
  constructor(private readonly repository: IChangeRequestsRepository) {}

  async execute(dto: CreateChangeRequestDto): Promise<ChangeRequest> {
    const entity = new ChangeRequest(
      ulid(),
      dto.employeeId,
      dto.mealSelectionId,
      dto.newMenuItemId,
      dto.newQuantity ?? null,
      dto.status,
      dto.approvedBy ?? null,
      dto.approvedAt ?? null,
    );
    return this.repository.insert(entity);
  }
}
