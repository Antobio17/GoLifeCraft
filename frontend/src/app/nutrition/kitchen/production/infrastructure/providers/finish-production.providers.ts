import { Provider } from "@angular/core";
import { FinishProductionPort } from "@nutrition/kitchen/production/domain/ports/finish-production.port";
import { InMemoryFinishProductionAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/in-memory-finish-production.adapter";
import { FinishProductionService } from "@nutrition/kitchen/production/application/services/finish-production.service";

export class FinishProductionProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: FinishProductionPort,
        useClass: InMemoryFinishProductionAdapter,
      },
      {
        provide: FinishProductionService,
        useFactory: (port: FinishProductionPort) =>
          new FinishProductionService(port),
        deps: [FinishProductionPort],
      },
    ];
  }
}
