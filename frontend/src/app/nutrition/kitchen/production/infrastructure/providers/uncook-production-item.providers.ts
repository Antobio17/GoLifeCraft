import { Provider } from "@angular/core";
import { UncookProductionItemPort } from "@nutrition/kitchen/production/domain/ports/uncook-production-item.port";
import { HttpUncookProductionItemAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-uncook-production-item.adapter";
import { UncookProductionItemService } from "@nutrition/kitchen/production/application/services/uncook-production-item.service";

export class UncookProductionItemProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: UncookProductionItemPort,
        useClass: HttpUncookProductionItemAdapter,
      },
      {
        provide: UncookProductionItemService,
        useFactory: (port: UncookProductionItemPort) =>
          new UncookProductionItemService(port),
        deps: [UncookProductionItemPort],
      },
    ];
  }
}
