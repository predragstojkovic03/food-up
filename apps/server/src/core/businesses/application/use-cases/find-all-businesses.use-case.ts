import { Business } from '../../domain/business.entity';
import { IBusinessesRepository } from '../../domain/businesses.repository.interface';

export class FindAllBusinessesUseCase {
  constructor(private readonly repository: IBusinessesRepository) {}

  async execute(): Promise<Business[]> {
    return this.repository.findAll();
  }
}
