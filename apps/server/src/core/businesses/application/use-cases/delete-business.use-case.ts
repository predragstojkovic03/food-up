import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { IBusinessesRepository } from '../../domain/businesses.repository.interface';

export class DeleteBusinessUseCase {
  constructor(private readonly _repository: IBusinessesRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this._repository.findOneByCriteria({ id });
    if (!existing) {
      throw new EntityInstanceNotFoundException('Business not found');
    }
    await this._repository.delete(id);
  }
}
