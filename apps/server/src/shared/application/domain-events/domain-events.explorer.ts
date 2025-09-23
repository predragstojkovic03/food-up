import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner, Reflector } from '@nestjs/core';
import { DomainEventsProvider } from './domain-events-provider';
import { DOMAIN_EVENTS_KEY } from './domain-events.decorator';

@Injectable()
export class DomainEventsExplorer implements OnModuleInit {
  constructor(
    private readonly _discoveryService: DiscoveryService,
    private readonly _domainEventsProvider: DomainEventsProvider,
    private readonly _metadataScanner: MetadataScanner,
    private _reflector: Reflector,
  ) {}

  private _logger = new Logger(DomainEventsExplorer.name);

  onModuleInit() {
    this.explore();
  }

  private explore(): void {
    const providers = this._discoveryService.getProviders();

    providers.forEach((wrapper) => {
      const { instance } = wrapper;

      if (!instance) {
        return;
      }

      const prototype = Object.getPrototypeOf(instance);

      this._metadataScanner
        .getAllMethodNames(prototype)
        .forEach((methodName) => {
          const methodRef = instance[methodName];
          const isPointCutSet = this._reflector.get<boolean>(
            DOMAIN_EVENTS_KEY,
            methodRef,
          );

          if (!isPointCutSet) {
            return;
          }

          // Register domain event handler
          this._domainEventsProvider.attach(instance, methodName);

          this._logger.log(`Registered {${wrapper.name}.${methodName}}`);
        });
    });
  }
}
