import { Business } from 'src/core/businesses/domain/business.entity';
import { IBusinessesRepository } from 'src/core/businesses/domain/businesses.repository.interface';

export class FindBusinessesBulkUseCase {
  constructor(private readonly _repository: IBusinessesRepository) {}

  async execute(businessIds: string[]): Promise<Business[]> {
    if (businessIds.length === 0) {
      return [];
    }
    return this._repository.findBulkByIds(businessIds);
  }
}
