import { Inject, Injectable } from '@nestjs/common';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { BusinessInvite } from '../domain/business-invite.entity';
import {
  I_BUSINESS_INVITES_REPOSITORY,
  IBusinessInvitesRepository,
} from '../domain/business-invites.repository.interface';

const INVITE_EXPIRY_DAYS = 7;

@Injectable()
export class BusinessInvitesService {
  constructor(
    @Inject(I_BUSINESS_INVITES_REPOSITORY)
    private readonly _repository: IBusinessInvitesRepository,
    @Inject(I_LOGGER) private readonly _logger: ILogger,
  ) {}

  async create(businessId: string, email: string): Promise<BusinessInvite> {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = BusinessInvite.create(businessId, email, expiresAt);
    await this._repository.insert(invite);
    this._logger.log(
      `Business invite created: id=${invite.id} businessId=${businessId} expiresAt=${expiresAt.toISOString()}`,
      BusinessInvitesService.name,
    );
    return invite;
  }

  async validate(token: string): Promise<string | null> {
    const invite = await this._repository.findOneByCriteria({ token } as Partial<BusinessInvite>);
    if (!invite || invite.isExpired || invite.isUsed) {
      this._logger.warn(
        `Invite validation failed: expired=${invite?.isExpired ?? 'not found'} used=${invite?.isUsed ?? 'not found'}`,
        BusinessInvitesService.name,
      );
      return null;
    }
    return invite.email;
  }

  async consume(token: string): Promise<BusinessInvite> {
    const invite = await this._repository.findOneByCriteria({ token } as Partial<BusinessInvite>);

    if (!invite) {
      throw new EntityInstanceNotFoundException('Invite not found or invalid.');
    }

    invite.consume();
    await this._repository.update(invite.id, invite);
    this._logger.log(
      `Business invite consumed: id=${invite.id} businessId=${invite.businessId}`,
      BusinessInvitesService.name,
    );
    return invite;
  }
}
