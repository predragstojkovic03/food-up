import { createDecorator } from '@toss/nestjs-aop';

export const DISPATCH_DOMAIN_EVENTS_ASPECT = Symbol(
  'DISPATCH_DOMAIN_EVENTS_ASPECT',
);

export const DispatchDomainEvents = (): MethodDecorator =>
  createDecorator(DISPATCH_DOMAIN_EVENTS_ASPECT);
