import { DomainException } from './domain.exception';

export class UnauthorizedException extends DomainException {
  constructor(message: string = 'Unauthorized') {
    super(message);
  }
}
