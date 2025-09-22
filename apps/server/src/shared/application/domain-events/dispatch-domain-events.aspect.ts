import { Inject } from '@nestjs/common';
import { Aspect, LazyDecorator, WrapParams } from '@toss/nestjs-aop';
import { Entity } from 'src/shared/domain/entity';
import { I_LOGGER, ILogger } from '../logger.interface';
import { DISPATCH_DOMAIN_EVENTS_ASPECT } from './dispatch-events.decorator';

@Aspect(DISPATCH_DOMAIN_EVENTS_ASPECT)
export class DispatchDomainEventsAspect implements LazyDecorator<any, void> {
  constructor(@Inject(I_LOGGER) private readonly _logger: ILogger) {}

  wrap({ method }: WrapParams): unknown {
    return async (...args: unknown[]) => {
      const result = await method(...args);

      if (result instanceof Entity) {
        const events = result.pullDomainEvents();
        for (const event of events) {
          this._logger.log('Dispatching event: ' + event.name);
        }
      }

      return result;
    };
  }
}
