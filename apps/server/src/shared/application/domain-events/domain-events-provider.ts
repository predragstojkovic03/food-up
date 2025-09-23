import { Inject, Injectable } from '@nestjs/common';
import { Entity } from 'src/shared/domain/entity';
import { I_LOGGER, ILogger } from '../logger.interface';

@Injectable()
export class DomainEventsProvider {
  constructor(@Inject(I_LOGGER) private readonly _logger: ILogger) {}

  attach(
    instance: Record<string, (...args: unknown[]) => Promise<any>>,
    methodName: string,
  ) {
    const originalMethod = instance[methodName];

    instance[methodName] = async (...args: unknown[]) => {
      const result = await originalMethod.apply(instance, args);

      if (result instanceof Entity) {
        const domainEvents = result.pullDomainEvents();

        for (const domainEvent of domainEvents) {
          this._logger.log(
            `Domain Event Dispatched: ${domainEvent.constructor.name}`,
          );
        }
      }

      return result;
    };
  }
}
