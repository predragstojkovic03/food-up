import { Injectable } from '@nestjs/common';
import { Identity } from '../../domain/identity.entity';
import { IIdentityRepository } from '../../domain/identity.repository.interface';

@Injectable()
export class FindIdentityUseCase {
  constructor(private readonly repo: IIdentityRepository) {}
  async execute(id: string): Promise<Identity | null> {
    return this.repo.findById(id);
  }
}
