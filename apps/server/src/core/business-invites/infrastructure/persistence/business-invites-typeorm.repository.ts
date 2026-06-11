import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource, IsNull, LessThan, MoreThan } from 'typeorm';
import { BusinessInvite } from '../../domain/business-invite.entity';
import { IBusinessInvitesRepository } from '../../domain/business-invites.repository.interface';
import { BusinessInviteTypeOrmMapper } from './business-invite-typeorm.mapper';
import { BusinessInvite as BusinessInvitePersistence } from './business-invite.typeorm-entity';

@Injectable()
export class BusinessInvitesTypeOrmRepository
  extends TypeOrmRepository<BusinessInvite, BusinessInvitePersistence>
  implements IBusinessInvitesRepository
{
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(
      dataSource,
      BusinessInvitePersistence,
      new BusinessInviteTypeOrmMapper(),
      transactionContext,
    );
  }

  async findActiveByBusiness(businessId: string): Promise<BusinessInvite[]> {
    const rows = await this._repository.find({
      where: {
        businessId,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
      order: { expiresAt: 'ASC' },
    });
    return rows.map((r) => this._mapper.toDomain(r));
  }

  async findActiveByEmail(businessId: string, email: string): Promise<BusinessInvite | null> {
    const row = await this._repository.findOne({
      where: {
        businessId,
        email,
        usedAt: IsNull(),
        expiresAt: MoreThan(new Date()),
      },
    });
    return row ? this._mapper.toDomain(row) : null;
  }
}
