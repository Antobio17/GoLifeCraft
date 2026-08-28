import { Provider } from "@angular/core";
import { DiscardProductionPort } from "@nutrition/kitchen/production/domain/ports/discard-production.port";
import { HttpDiscardProductionAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-discard-production.adapter";
import { DiscardProductionService } from "@nutrition/kitchen/production/application/services/discard-production.service";

export class DiscardProductionProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: DiscardProductionPort,
        useClass: HttpDiscardProductionAdapter,
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
