import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { compare } from 'bcrypt';
import { Identity, IdentityType } from '../domain/identity.entity';
import {
  I_IDENTITY_REPOSITORY,
  IIdentityRepository,
} from '../domain/identity.repository.interface';

@Injectable()
export class IdentityService {
  constructor(
    @Inject(I_IDENTITY_REPOSITORY) private readonly repo: IIdentityRepository,
  ) {}

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

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<Identity> {
    const identity = await this.findByEmail(email);
    if (!identity) throw new UnauthorizedException('Invalid credentials');

    const isValid = await identity.isPasswordValid(
      password,
      compare.bind(identity),
    );
    if (!isValid) throw new UnauthorizedException('Invalid credentials');

    return identity;
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
