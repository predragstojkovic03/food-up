import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { Business } from '../../domain/business.entity';
import { IBusinessesRepository } from '../../domain/businesses.repository.interface';

export interface UpdateBusinessDto {
  name?: string;
  contactEmail?: string;
}

export class UpdateBusinessUseCase {
  constructor(private readonly _repository: IBusinessesRepository) {}

  async execute(id: string, dto: UpdateBusinessDto): Promise<Business> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing) {
      throw new EntityInstanceNotFoundException('Business not found');
    }
    const updated = new Business(
      id,
      dto.name ?? existing.name,
      dto.contactEmail ?? existing.contactEmail,
    );
    return this._repository.update(id, updated);
  }
}
