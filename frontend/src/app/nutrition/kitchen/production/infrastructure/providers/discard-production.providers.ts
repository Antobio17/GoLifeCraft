import { Provider } from "@angular/core";
import { DiscardProductionPort } from "@nutrition/kitchen/production/domain/ports/discard-production.port";
import { InMemoryDiscardProductionAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/in-memory-discard-production.adapter";
import { DiscardProductionService } from "@nutrition/kitchen/production/application/services/discard-production.service";

export class DiscardProductionProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: DiscardProductionPort,
        useClass: InMemoryDiscardProductionAdapter,
      },
      {
        provide: DiscardProductionService,
        useFactory: (port: DiscardProductionPort) =>
          new DiscardProductionService(port),
        deps: [DiscardProductionPort],
      },
    ];
  }
}
