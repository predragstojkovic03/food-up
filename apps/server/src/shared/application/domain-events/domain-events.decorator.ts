import { SetMetadata } from '@nestjs/common';

export const DOMAIN_EVENTS_KEY = Symbol('DOMAIN_EVENTS');

export const DomainEvents = SetMetadata(DOMAIN_EVENTS_KEY, true);
