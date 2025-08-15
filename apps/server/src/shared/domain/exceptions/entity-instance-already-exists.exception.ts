export class EntityInstanceAlreadyExistsException extends Error {
  constructor(message: string = 'Entity instance already exists') {
    super(message);
    this.name = 'EntityInstanceAlreadyExistsException';
  }
}
