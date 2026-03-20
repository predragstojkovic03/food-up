import { Inject, Injectable } from '@nestjs/common';
import { compare, hash } from 'bcrypt';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { AuthenticationException } from 'src/shared/domain/exceptions/authentication.exception';
import { IdentityType } from '@food-up/shared';
import { Identity } from '../domain/identity.entity';
import {
  I_IDENTITY_REPOSITORY,
  IIdentityRepository,
} from '../domain/identity.repository.interface';
import { CreateIdentityDto } from './dto/create-identity.dto';

@Injectable()
export class IdentityService {
  constructor(
    @Inject(I_IDENTITY_REPOSITORY)
    private readonly _repository: IIdentityRepository,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async create(dto: CreateIdentityDto): Promise<Identity> {
    const passwordHash = await hash(dto.password, 10);

    const entity = Identity.create(
      dto.email,
      passwordHash,
      dto.type as IdentityType,
      dto.isActive ?? true,
    );

    const result = await this._repository.create(entity);
    this._logger.log(
      `Identity created: id=${result.id} type=${dto.type}`,
      IdentityService.name,
    );
    return result;
  }

  async validateCredentials(
    email: string,
    password: string,
  ): Promise<Identity> {
    this._logger.debug('Validating credentials', IdentityService.name);
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
    return this._repository.findByEmail(email);
  }

  async findById(id: string): Promise<Identity | null> {
    return this._repository.findById(id);
  }

  async update(id: string, update: Partial<Identity>): Promise<Identity> {
    const result = await this._repository.update(id, update);
    this._logger.log(`Identity updated: id=${id}`, IdentityService.name);
    return result;
  }

  async delete(id: string): Promise<void> {
    await this._repository.delete(id);
    this._logger.log(`Identity deleted: id=${id}`, IdentityService.name);
  }
}
