import { Provider } from "@angular/core";
import { StartProductionPort } from "@nutrition/kitchen/production/domain/ports/start-production.port";
import { InMemoryStartProductionAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/in-memory-start-production.adapter";
import { StartProductionService } from "@nutrition/kitchen/production/application/services/start-production.service";

export class StartProductionProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: StartProductionPort,
        useClass: InMemoryStartProductionAdapter,
      },
      {
        provide: StartProductionService,
        useFactory: (port: StartProductionPort) =>
          new StartProductionService(port),
        deps: [StartProductionPort],
      },
    ];
  }
}
