import { Provider } from "@angular/core";
import { FinishProductionPort } from "@nutrition/kitchen/production/domain/ports/finish-production.port";
import { HttpFinishProductionAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-finish-production.adapter";
import { FinishProductionService } from "@nutrition/kitchen/production/application/services/finish-production.service";

export class FinishProductionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: FinishProductionPort, useClass: HttpFinishProductionAdapter },
      {
        provide: FinishProductionService,
        useFactory: (port: FinishProductionPort) =>
          new FinishProductionService(port),
        deps: [FinishProductionPort],
      },
    ];
  }
}
