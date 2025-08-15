import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { Identity } from '../../domain/identity.entity';
import { IIdentityRepository } from '../../domain/identity.repository.interface';

@Injectable()
export class ValidateCredentialsUseCase {
  constructor(private readonly repo: IIdentityRepository) {}
  async execute(email: string, password: string): Promise<Identity | null> {
    const identity = await this.repo.findByEmail(email);
    if (!identity) return null;
    const valid = await identity.isPasswordValid(password, (password, hash) =>
      bcrypt.compare(password, hash),
    );
    return valid ? identity : null;
  }
}
