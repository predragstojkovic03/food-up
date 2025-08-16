export class InvalidInputDataException extends Error {
  constructor(message: string = 'Invalid input data') {
    super(message);
    this.name = 'InvalidInputDataException';
  }
}
