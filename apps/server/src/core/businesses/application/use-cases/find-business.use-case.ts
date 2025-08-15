import { Business } from '../../domain/business.entity';
import { IBusinessesRepository } from '../../domain/businesses.repository.interface';

export class FindBusinessUseCase {
  constructor(private readonly _repository: IBusinessesRepository) {}

  async execute(id: string): Promise<Business | null> {
    return this._repository.findOneByCriteria({ id });
  }
}
