export class InvalidOperationException extends Error {
  constructor(message: string = 'Invalid operation') {
    super(message);
    this.name = 'InvalidOperationException';
  }
}
