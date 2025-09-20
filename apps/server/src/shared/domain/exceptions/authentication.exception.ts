export class AuthenticationException extends Error {
  constructor(message?: string) {
    super(message ?? 'Authentication failed');
    this.name = 'AuthenticationException';
  }
}
