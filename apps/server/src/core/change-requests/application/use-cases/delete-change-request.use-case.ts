import { IChangeRequestsRepository } from '../../domain/change-requests.repository.interface';

export class DeleteChangeRequestUseCase {
  constructor(private readonly repository: IChangeRequestsRepository) {}

  async execute(id: string): Promise<void> {
    await this.repository.delete(id);
  }
}
