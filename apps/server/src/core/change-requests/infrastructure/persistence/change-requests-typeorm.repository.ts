import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { ChangeRequest } from '../../domain/change-request.entity';
import { ChangeRequestTypeOrmMapper } from './change-request-typeorm.mapper';
import { ChangeRequest as ChangeRequestPersistence } from './change-request.typeorm-entity';

@Injectable()
export class ChangeRequestsTypeOrmRepository extends TypeOrmRepository<ChangeRequest> {
  constructor(
    @InjectRepository(ChangeRequestPersistence)
    repository: Repository<ChangeRequestPersistence>,
  ) {
    super(repository, new ChangeRequestTypeOrmMapper());
  }
}
