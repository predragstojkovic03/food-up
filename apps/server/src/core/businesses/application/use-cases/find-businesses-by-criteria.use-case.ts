import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { Business } from '../../domain/business.entity';
import { IBusinessesRepository } from '../../domain/businesses.repository.interface';

export class FindBusinessesByCriteriaUseCase {
  constructor(private readonly repository: IBusinessesRepository) {}

  async execute(criteria: Partial<Business>): Promise<Business[]> {
    const businesses = await this.repository.findByCriteria(criteria);
    if (!businesses || businesses.length === 0) {
      throw new EntityInstanceNotFoundException(
        'No businesses found matching the criteria',
      );
    }

    return businesses;
  }
}
