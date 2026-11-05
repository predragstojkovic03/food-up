import { DomainException } from './domain.exception';

/** The caller is authenticated but not allowed to perform the operation (HTTP 403). */
export class AccessDeniedException extends DomainException {
  constructor(message: string = 'Access denied') {
    super(message);
  }
}
