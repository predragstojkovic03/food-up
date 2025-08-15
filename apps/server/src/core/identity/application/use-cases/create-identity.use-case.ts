import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Identity, IdentityType } from '../../domain/identity.entity';
import { IIdentityRepository } from '../../domain/identity.repository.interface';

@Injectable()
export class CreateIdentityUseCase {
  constructor(private readonly repo: IIdentityRepository) {}
  async execute(identity: {
    id: string;
    email: string;
    password: string;
    type: IdentityType;
    isActive: boolean;
  }): Promise<Identity> {
    const passwordHash = await bcrypt.hash(identity.password, 10);
    const identityToSave = new Identity(
      identity.id,
      identity.email,
      passwordHash,
      identity.type,
      identity.isActive,
    );
    return this.repo.create(identityToSave);
  }
}
