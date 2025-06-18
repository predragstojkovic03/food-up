import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { Report } from '../../domain/report.entity';
import { ReportTypeOrmMapper } from './report-typeorm.mapper';
import { Report as ReportPersistence } from './report.typeorm-entity';

@Injectable()
export class ReportsTypeOrmRepository extends TypeOrmRepository<Report> {
  constructor(
    @InjectRepository(ReportPersistence)
    repository: Repository<ReportPersistence>,
  ) {
    super(repository, new ReportTypeOrmMapper());
  }
}
