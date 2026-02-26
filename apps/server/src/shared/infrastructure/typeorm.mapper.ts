import { ObjectLiteral } from 'typeorm';
import { Mapper } from '../application/mapper.abstract';

export abstract class TypeOrmMapper<
  Domain,
  Persistence extends ObjectLiteral,
> extends Mapper<Domain, Persistence> {}
