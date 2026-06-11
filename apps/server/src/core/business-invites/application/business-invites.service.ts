import { Inject, Injectable } from '@nestjs/common';
import { Language } from '@food-up/shared';
import { EnvironmentVariables } from 'src/env.validation';
import { I_CONFIG_SERVICE, IConfigService } from 'src/shared/application/config-service.interface';
import { I_LOGGER, ILogger } from 'src/shared/application/logger.interface';
import { EntityInstanceNotFoundException } from 'src/shared/domain/exceptions/entity-instance-not-found.exception';
import { InvalidOperationException } from 'src/shared/domain/exceptions/invalid-operation.exception';
import { t } from 'src/shared/i18n/i18n.helper';
import { I_MAIL_SERVICE, IMailService } from 'src/shared/infrastructure/notifications/mail/mail.service.interface';
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
    @Inject(I_MAIL_SERVICE) private readonly _mailService: IMailService,
    @Inject(I_CONFIG_SERVICE)
    private readonly _configService: IConfigService<EnvironmentVariables, true>,
  ) {}

  async create(businessId: string, email: string, language: Language): Promise<BusinessInvite> {
    const existing = await this._repository.findActiveByEmail(businessId, email);
    if (existing) {
      await this._repository.delete(existing.id);
      this._logger.log(
        `Superseded existing active invite: id=${existing.id} email=${email}`,
        BusinessInvitesService.name,
      );
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + INVITE_EXPIRY_DAYS);

    const invite = BusinessInvite.create(businessId, email, expiresAt);
    await this._repository.insert(invite);
    this._logger.log(
      `Business invite created: id=${invite.id} businessId=${businessId} expiresAt=${expiresAt.toISOString()}`,
      BusinessInvitesService.name,
    );

    await this._trySendEmail(invite, language);
    return invite;
  }

  async resend(inviteId: string, language: Language): Promise<BusinessInvite> {
    const invite = await this._repository.findOneByCriteriaOrThrow({ id: inviteId } as Partial<BusinessInvite>);

    if (!invite.isActive) {
      throw new InvalidOperationException('Invite is no longer active.');
    }

    await this._trySendEmail(invite, language);
    return invite;
  }

  async findActiveByBusiness(businessId: string): Promise<BusinessInvite[]> {
    return this._repository.findActiveByBusiness(businessId);
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

  private async _trySendEmail(invite: BusinessInvite, language: Language): Promise<void> {
    const webAppUrl = this._configService.getOrThrow('WEB_APP_URL');
    const registrationUrl = `${webAppUrl}/register?invite=${invite.token}`;

    const subject = t(tr => tr.mail.invite.subject, language);
    const heading = t(tr => tr.mail.invite.heading, language);
    const body = t(tr => tr.mail.invite.body, language);
    const button = t(tr => tr.mail.invite.button, language);
    const footer = t(tr => tr.mail.invite.footer, language);

    const html = `
<div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px 24px; color: #111;">
  <h2 style="margin: 0 0 12px;">${heading}</h2>
  <p style="margin: 0 0 24px; color: #555; line-height: 1.5;">${body}</p>
  <a href="${registrationUrl}"
     style="display: inline-block; background: #111; color: #fff; padding: 12px 24px; border-radius: 6px; text-decoration: none; font-weight: 600;">
    ${button}
  </a>
  <p style="margin: 24px 0 0; color: #999; font-size: 13px;">${footer}</p>
</div>`;

    try {
      await this._mailService.send(invite.email, subject, html);
      invite.markEmailSent();
      await this._repository.update(invite.id, invite);
      this._logger.log(
        `Invite email sent: id=${invite.id} to=${invite.email}`,
        BusinessInvitesService.name,
      );
    } catch (error) {
      this._logger.warn(
        `Failed to send invite email: id=${invite.id} to=${invite.email} error=${(error as Error).message}`,
        BusinessInvitesService.name,
      );
    }
  }
}
