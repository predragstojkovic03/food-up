import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Mapper } from '../application/mapper.interface';

export abstract class TypeOrmMapper<
  Domain,
  Persistence extends QueryDeepPartialEntity<Domain>,
> extends Mapper<Domain, Persistence> {}
