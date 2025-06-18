import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { MenuPeriod } from '../../domain/menu-period.entity';
import { MenuPeriodTypeOrmMapper } from './menu-period-typeorm.mapper';
import { MenuPeriod as MenuPeriodPersistence } from './menu-period.typeorm-entity';

@Injectable()
export class MenuPeriodsTypeOrmRepository extends TypeOrmRepository<MenuPeriod> {
  constructor(
    @InjectRepository(MenuPeriodPersistence)
    repository: Repository<MenuPeriodPersistence>,
  ) {
    super(repository, new MenuPeriodTypeOrmMapper());
  }
}
