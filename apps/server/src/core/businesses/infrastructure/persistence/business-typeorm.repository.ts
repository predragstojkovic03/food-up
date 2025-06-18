import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { TypeOrmRepository } from 'src/shared/infrastructure/typeorm.repository';
import { Repository } from 'typeorm';
import { Business } from '../../domain/business.entity';
import { BusinessTypeOrmMapper } from './business-typeorm.mapper';

@Injectable()
export class BusinessTypeormRepository extends TypeOrmRepository<Business> {
  constructor(
    @InjectRepository(Business) businessRepository: Repository<Business>,
  ) {
    super(businessRepository, new BusinessTypeOrmMapper());
  }
}
