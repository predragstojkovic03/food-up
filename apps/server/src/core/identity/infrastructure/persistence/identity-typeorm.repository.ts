import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Identity } from '../../domain/identity.entity';
import { IIdentityRepository } from '../../domain/identity.repository.interface';

@Injectable()
export class IdentityTypeOrmRepository implements IIdentityRepository {
  constructor(
    @InjectRepository(Identity)
    private readonly repo: Repository<Identity>,
  ) {}

  async findByEmail(email: string): Promise<Identity | null> {
    const entity = await this.repo.findOne({ where: { email } });
    return entity ? this.toDomain(entity) : null;
  }

  async findById(id: string): Promise<Identity | null> {
    const entity = await this.repo.findOne({ where: { id } });
    return entity ? this.toDomain(entity) : null;
  }

  async create(identity: Identity): Promise<Identity> {
    const entity = this.repo.create(identity);
    const saved = await this.repo.save(entity);
    return this.toDomain(saved);
  }

  async update(id: string, update: Partial<Identity>): Promise<Identity> {
    await this.repo.update(id, update);
    const updated = await this.repo.findOne({ where: { id } });
    if (!updated) throw new Error('Identity not found');
    return this.toDomain(updated);
  }

  async delete(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  private toDomain(entity: Identity): Identity {
    return new Identity(
      entity.id,
      entity.email,
      entity.passwordHash,
      entity.type,
      entity.isActive,
    );
  }
}
