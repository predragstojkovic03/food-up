import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { Business } from '../../domain/business.entity';
import { BusinessMapper } from './business.mapper';

@Injectable()
export class BusinessTypeormRepository extends TypeOrmRepository<Business> {
  constructor(
    @InjectRepository(Business) businessRepository: Repository<Business>,
  ) {
    super(businessRepository, new BusinessMapper());
  }
}
