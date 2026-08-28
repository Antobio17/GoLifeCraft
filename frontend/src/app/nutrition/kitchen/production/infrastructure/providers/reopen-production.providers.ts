import { Provider } from "@angular/core";
import { ReopenProductionPort } from "@nutrition/kitchen/production/domain/ports/reopen-production.port";
import { HttpReopenProductionAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-reopen-production.adapter";
import { ReopenProductionService } from "@nutrition/kitchen/production/application/services/reopen-production.service";

export class ReopenProductionProviders {
  static getProviders(): Provider[] {
    return [
      { provide: ReopenProductionPort, useClass: HttpReopenProductionAdapter },
      {
        provide: ReopenProductionService,
        useFactory: (port: ReopenProductionPort) =>
          new ReopenProductionService(port),
        deps: [ReopenProductionPort],
      },
    ];
  }
}
