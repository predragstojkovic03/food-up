import { DomainException } from './domain.exception';

export class EntityInstanceNotFoundException extends DomainException {
  constructor(message: string = 'Entity instance not found') {
    super(message);
  }
}
