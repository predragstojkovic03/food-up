import { Inject, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { AuthenticationException } from 'src/shared/domain/exceptions/authentication.exception';
import { ulid } from 'ulid';
import { Identity, IdentityType } from '../domain/identity.entity';
import {
  I_IDENTITY_REPOSITORY,
  IIdentityRepository,
} from '../domain/identity.repository.interface';
import { CreateIdentityDto } from './dto/create-identity.dto';

@Injectable()
export class IdentityService {
  constructor(
    @Inject(I_IDENTITY_REPOSITORY) private readonly repo: IIdentityRepository,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async create(dto: CreateIdentityDto): Promise<Identity> {
    const passwordHash = await hash(dto.password, 10);

    const entity = new Identity(
      ulid(),
      dto.email,
      passwordHash,
      dto.type as IdentityType,
      dto.isActive ?? true,
    );

    return this.repo.create(entity);
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<Identity> {
    this._logger.debug(`Password ${password} for email ${email}`);
    const identity = await this.findByEmail(email);
    if (!identity) throw new AuthenticationException('Invalid credentials');

    const isValid = await identity.isPasswordValid(
      password,
      compare.bind(identity),
    );
    if (!isValid) throw new AuthenticationException('Invalid credentials');

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
