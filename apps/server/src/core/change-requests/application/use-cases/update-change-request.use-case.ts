import { ChangeRequest } from '../../domain/change-request.entity';
import { IChangeRequestsRepository } from '../../domain/change-requests.repository.interface';

export interface UpdateChangeRequestDto {
  employeeId?: string;
  mealSelectionId?: string;
  newMenuItemId?: string;
  newQuantity?: number | null;
  status?: 'pending' | 'approved' | 'rejected';
  approvedBy?: string | null;
  approvedAt?: Date | null;
}

export class UpdateChangeRequestUseCase {
  constructor(private readonly repository: IChangeRequestsRepository) {}

  async execute(
    id: string,
    dto: UpdateChangeRequestDto,
  ): Promise<ChangeRequest> {
    const existing = await this.repository.findOneByCriteria({ id });
    if (!existing) throw new Error('ChangeRequest not found');
    const updated = new ChangeRequest(
      id,
      dto.employeeId ?? existing.employeeId,
      dto.mealSelectionId ?? existing.mealSelectionId,
      dto.newMenuItemId ?? existing.newMenuItemId,
      dto.newQuantity ?? existing.newQuantity,
      dto.status ?? existing.status,
      dto.approvedBy ?? existing.approvedBy,
      dto.approvedAt ?? existing.approvedAt,
    );
    return this.repository.update(id, updated);
  }
}
