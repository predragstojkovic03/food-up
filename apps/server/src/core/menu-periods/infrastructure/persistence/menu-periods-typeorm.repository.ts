import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { TransactionContext } from 'src/shared/infrastructure/transaction-context';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { DataSource } from 'typeorm';
import { MenuPeriod } from '../../domain/menu-period.entity';
import { MenuPeriodTypeOrmMapper } from './menu-period-typeorm.mapper';
import { MenuPeriod as MenuPeriodPersistence } from './menu-period.typeorm-entity';

@Injectable()
export class MenuPeriodsTypeOrmRepository extends TypeOrmRepository<MenuPeriod, MenuPeriodPersistence> {
  constructor(
    @InjectDataSource() dataSource: DataSource,
    transactionContext: TransactionContext,
  ) {
    super(dataSource, MenuPeriodPersistence, new MenuPeriodTypeOrmMapper(), transactionContext);
  }
}
