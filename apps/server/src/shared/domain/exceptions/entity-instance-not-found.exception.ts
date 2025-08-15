export class EntityInstanceNotFoundException extends Error {
  constructor(message: string = 'Entity instance not found') {
    super(message);
    this.name = 'EntityInstanceNotFoundException';
  }
}
