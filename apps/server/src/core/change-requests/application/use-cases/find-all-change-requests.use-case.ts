import { ChangeRequest } from '../../domain/change-request.entity';
import { IChangeRequestsRepository } from '../../domain/change-requests.repository.interface';

export class FindAllChangeRequestsUseCase {
  constructor(private readonly repository: IChangeRequestsRepository) {}

  async execute(): Promise<ChangeRequest[]> {
    return this.repository.findAll();
  }
}
