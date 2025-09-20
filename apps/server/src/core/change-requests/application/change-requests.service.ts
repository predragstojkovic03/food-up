import { Inject, Injectable } from '@nestjs/common';
import { ChangeRequest } from '../domain/change-request.entity';
import {
  I_CHANGE_REQUESTS_REPOSITORY,
  IChangeRequestsRepository,
} from '../domain/change-requests.repository.interface';

@Injectable()
export class ChangeRequestsService {
  constructor(
    @Inject(I_CHANGE_REQUESTS_REPOSITORY)
    private readonly repo: IChangeRequestsRepository,
  ) {}

  async create(dto: any): Promise<ChangeRequest> {
    // Map DTO to entity
    const entity = new ChangeRequest(
      dto.id,
      dto.employeeId,
      dto.mealSelectionId,
      dto.newMenuItemId,
      dto.newQuantity,
      dto.status,
      dto.approvedBy,
      dto.approvedAt,
    );
    return this.repo.insert(entity);
  }

  async findAll(): Promise<ChangeRequest[]> {
    return this.repo.findAll();
  }

  async findOne(id: string): Promise<ChangeRequest | null> {
    return this.repo.findOneByCriteria({ id });
  }

  async update(id: string, dto: any): Promise<ChangeRequest> {
    // Map DTO to entity
    const entity = new ChangeRequest(
      id,
      dto.employeeId,
      dto.mealSelectionId,
      dto.newMenuItemId,
      dto.newQuantity,
      dto.status,
      dto.approvedBy,
      dto.approvedAt,
    );
    return this.repo.update(id, entity);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
