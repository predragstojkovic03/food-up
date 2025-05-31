import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { Mapper } from '../application/mapper.interface';

export abstract class ITypeOrmMapper<
  T,
  U extends QueryDeepPartialEntity<T>,
> extends Mapper<T, U> {}
