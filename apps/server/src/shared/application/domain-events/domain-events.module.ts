import { Global, Module } from '@nestjs/common';
import { DispatchDomainEventsAspect } from './dispatch-domain-events.aspect';

@Global()
@Module({
  providers: [DispatchDomainEventsAspect],
  exports: [DispatchDomainEventsAspect],
})
export class DomainEventsModule {}
