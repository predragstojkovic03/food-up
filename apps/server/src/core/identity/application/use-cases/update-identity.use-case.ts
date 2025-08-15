import { Injectable } from '@nestjs/common';
import { Identity } from '../../domain/identity.entity';
import { IIdentityRepository } from '../../domain/identity.repository.interface';

@Injectable()
export class UpdateIdentityUseCase {
  constructor(private readonly repo: IIdentityRepository) {}
  async execute(id: string, update: Partial<Identity>): Promise<Identity> {
    return this.repo.update(id, update);
  }
}
