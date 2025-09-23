import { Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { DomainEventsProvider } from './domain-events-provider';
import { DomainEventsExplorer } from './domain-events.explorer';

@Module({
  imports: [DiscoveryModule],
  providers: [DomainEventsExplorer, DomainEventsProvider],
})
export class DomainEventsModule {}
