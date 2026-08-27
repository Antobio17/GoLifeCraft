import { Provider } from "@angular/core";
import { GetProductionPort } from "@nutrition/kitchen/production/domain/ports/get-production.port";
import { InMemoryGetProductionAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/in-memory-get-production.adapter";
import { GetProductionService } from "@nutrition/kitchen/production/application/services/get-production.service";

export class GetProductionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetProductionPort, useClass: InMemoryGetProductionAdapter },
      {
        provide: GetProductionService,
        useFactory: (port: GetProductionPort) => new GetProductionService(port),
        deps: [GetProductionPort],
      },
    ];
  }
}
