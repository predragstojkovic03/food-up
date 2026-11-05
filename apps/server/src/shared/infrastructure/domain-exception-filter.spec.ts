import { ArgumentsHost, HttpStatus } from '@nestjs/common';
import { NodeEnv } from 'src/env.validation';
import { AccessDeniedException } from '../domain/exceptions/access-denied.exception';
import { AuthenticationException } from '../domain/exceptions/authentication.exception';
import { DomainException } from '../domain/exceptions/domain.exception';
import { EntityInstanceAlreadyExistsException } from '../domain/exceptions/entity-instance-already-exists.exception';
import { EntityInstanceNotFoundException } from '../domain/exceptions/entity-instance-not-found.exception';
import { InvalidInputDataException } from '../domain/exceptions/invalid-input-data.exception';
import { InvalidOperationException } from '../domain/exceptions/invalid-operation.exception';
import { DomainExceptionFilter } from './domain-exception-filter';

describe('DomainExceptionFilter', () => {
  const filter = new DomainExceptionFilter(
    { get: jest.fn().mockReturnValue(NodeEnv.Production) } as any,
    { error: jest.fn() } as any,
  );

  function statusFor(exception: DomainException): number {
    const response = { status: jest.fn().mockReturnThis(), json: jest.fn() };
    const host = {
      switchToHttp: () => ({
        getResponse: () => response,
        getRequest: () => ({ path: '/test' }),
      }),
    } as unknown as ArgumentsHost;
    filter.catch(exception, host);
    return response.status.mock.calls[0][0];
  }

  it.each([
    [
      'AuthenticationException',
      new AuthenticationException(),
      HttpStatus.UNAUTHORIZED,
    ],
    [
      'AccessDeniedException',
      new AccessDeniedException(),
      HttpStatus.FORBIDDEN,
    ],
    [
      'InvalidInputDataException',
      new InvalidInputDataException('x'),
      HttpStatus.BAD_REQUEST,
    ],
    [
      'InvalidOperationException',
      new InvalidOperationException('x'),
      HttpStatus.BAD_REQUEST,
    ],
    [
      'EntityInstanceNotFoundException',
      new EntityInstanceNotFoundException(),
      HttpStatus.NOT_FOUND,
    ],
    [
      'EntityInstanceAlreadyExistsException',
      new EntityInstanceAlreadyExistsException(),
      HttpStatus.CONFLICT,
    ],
  ])('maps %s to %i', (_, exception, expected) => {
    expect(statusFor(exception)).toBe(expected);
  });
});
