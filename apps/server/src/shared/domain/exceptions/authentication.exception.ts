import { DomainException } from './domain.exception';

/** The caller's identity could not be established, e.g. invalid credentials (HTTP 401). */
export class AuthenticationException extends DomainException {
  constructor(message: string = 'Authentication failed') {
    super(message);
  }
}
