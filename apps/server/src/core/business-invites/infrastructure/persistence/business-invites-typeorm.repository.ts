import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { BusinessInvite } from '../../domain/business-invite.entity';
import { BusinessInviteTypeOrmMapper } from './business-invite-typeorm.mapper';
import { BusinessInvite as BusinessInvitePersistence } from './business-invite.typeorm-entity';

@Injectable()
export class BusinessInvitesTypeOrmRepository extends TypeOrmRepository<
  BusinessInvite,
  BusinessInvitePersistence
> {
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
}
