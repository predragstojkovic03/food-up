import { TypeOrmMapper } from 'src/shared/infrastructure/typeorm.mapper';
import { ChangeRequest } from '../../domain/change-request.entity';
import { ChangeRequest as ChangeRequestPersistence } from './change-request.typeorm-entity';

export class ChangeRequestTypeOrmMapper extends TypeOrmMapper<
  ChangeRequest,
  ChangeRequestPersistence
> {
  toDomain(persistence: ChangeRequestPersistence): ChangeRequest {
    return new ChangeRequest(
      persistence.id,
      persistence.employeeId,
      persistence.mealSelectionId,
      persistence.newMenuItem.id,
      persistence.newQuantity,
      persistence.status,
      persistence.clearSelection,
      persistence.approvedBy,
      persistence.approvedAt,
    );
  }

  toPersistence(domain: ChangeRequest): ChangeRequestPersistence {
    const persistence = new ChangeRequestPersistence();
    persistence.id = domain.id;
    persistence.employeeId = domain.employeeId;
    persistence.mealSelectionId = domain.mealSelectionId;
    persistence.newMenuItem = { id: domain.newMenuItemId } as any;
    persistence.newQuantity = domain.newQuantity;
    persistence.status = domain.status;
    persistence.approvedBy = domain.approvedBy;
    persistence.approvedAt = domain.approvedAt;
    return persistence;
  }

  toPersistencePartial(domain: Partial<ChangeRequest>): Partial<ChangeRequestPersistence> {
    const persistence: Partial<ChangeRequestPersistence> = {};
    if (domain.id !== undefined) persistence.id = domain.id;
    if (domain.employeeId !== undefined) persistence.employeeId = domain.employeeId;
    if (domain.mealSelectionId !== undefined) persistence.mealSelectionId = domain.mealSelectionId;
    if (domain.newQuantity !== undefined) persistence.newQuantity = domain.newQuantity;
    if (domain.status !== undefined) persistence.status = domain.status;
    if (domain.approvedBy !== undefined) persistence.approvedBy = domain.approvedBy;
    if (domain.approvedAt !== undefined) persistence.approvedAt = domain.approvedAt;
    if (domain.newMenuItemId !== undefined) persistence.newMenuItem = { id: domain.newMenuItemId } as any;
    return persistence;
  }
}
