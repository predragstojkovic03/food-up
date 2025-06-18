import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { ReportItem } from '../../domain/report-item.entity';
import { ReportItemTypeOrmMapper } from './report-item-typeorm.mapper';
import { ReportItem as ReportItemPersistence } from './report-item.typeorm-entity';

@Injectable()
export class ReportItemsTypeOrmRepository extends TypeOrmRepository<ReportItem> {
  constructor(
    @InjectRepository(ReportItemPersistence)
    repository: Repository<ReportItemPersistence>,
  ) {
    super(repository, new ReportItemTypeOrmMapper());
  }
}
