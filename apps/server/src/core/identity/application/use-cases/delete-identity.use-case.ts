import { Injectable } from '@nestjs/common';
import { IIdentityRepository } from '../../domain/identity.repository.interface';

@Injectable()
export class DeleteIdentityUseCase {
  constructor(private readonly repo: IIdentityRepository) {}
  async execute(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
