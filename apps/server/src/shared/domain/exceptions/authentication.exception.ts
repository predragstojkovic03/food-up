import { DomainException } from './domain.exception';

export class AuthenticationException extends DomainException {
  constructor(message: string = 'Authentication failed') {
    super(message);
  }
}
