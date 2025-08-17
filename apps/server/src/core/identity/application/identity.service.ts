import { Injectable } from '@nestjs/common';
import { Identity, IdentityType } from '../domain/identity.entity';
import { IIdentityRepository } from '../domain/identity.repository.interface';

@Injectable()
export class IdentityService {
  constructor(private readonly repo: IIdentityRepository) {}

  async create(dto: any): Promise<Identity> {
    const entity = new Identity(
      dto.id,
      dto.email,
      dto.passwordHash,
      dto.type as IdentityType,
      dto.isActive ?? true,
    );
    return this.repo.create(entity);
  }

  async findByEmail(email: string): Promise<Identity | null> {
    return this.repo.findByEmail(email);
  }

  async findById(id: string): Promise<Identity | null> {
    return this.repo.findById(id);
  }

  async update(id: string, update: Partial<Identity>): Promise<Identity> {
    return this.repo.update(id, update);
  }

  async delete(id: string): Promise<void> {
    return this.repo.delete(id);
  }
}
