import { DomainException } from './domain.exception';

export class InvalidOperationException extends DomainException {
  constructor(message: string = 'Invalid operation') {
    super(message);
  }
}
