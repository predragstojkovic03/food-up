import { DomainException } from './domain.exception';

export class InternalFailureException extends DomainException {
  constructor(message: string = 'Internal failure occurred') {
    super(message);
  }
}
