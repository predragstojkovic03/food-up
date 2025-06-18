import { ChangeRequest } from '../../domain/change-request.entity';
import { IChangeRequestsRepository } from '../../domain/change-requests.repository.interface';

export class FindChangeRequestUseCase {
  constructor(private readonly repository: IChangeRequestsRepository) {}

  async execute(id: string): Promise<ChangeRequest | null> {
    return this.repository.findOneByCriteria({ id });
  }
}
