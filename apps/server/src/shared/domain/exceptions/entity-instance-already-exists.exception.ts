import { DomainException } from './domain.exception';

export class EntityInstanceAlreadyExistsException extends DomainException {
  constructor(message: string = 'Entity instance already exists') {
    super(message);
  }
}
