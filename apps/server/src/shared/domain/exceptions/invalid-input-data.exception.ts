import { DomainException } from './domain.exception';

export class InvalidInputDataException extends DomainException {
  constructor(message: string = 'Invalid input data') {
    super(message);
  }
}
