import { Provider } from "@angular/core";
import { StartProductionPort } from "@nutrition/kitchen/production/domain/ports/start-production.port";
import { HttpStartProductionAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-start-production.adapter";
import { StartProductionService } from "@nutrition/kitchen/production/application/services/start-production.service";

export class StartProductionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: StartProductionPort, useClass: HttpStartProductionAdapter },
      {
        provide: StartProductionService,
        useFactory: (port: StartProductionPort) =>
          new StartProductionService(port),
        deps: [StartProductionPort],
      },
    ];
  }
}
