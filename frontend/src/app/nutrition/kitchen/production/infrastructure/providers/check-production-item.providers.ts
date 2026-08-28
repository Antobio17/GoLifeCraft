import { Provider } from "@angular/core";
import { CheckProductionItemPort } from "@nutrition/kitchen/production/domain/ports/check-production-item.port";
import { HttpCheckProductionItemAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-check-production-item.adapter";
import { CheckProductionItemService } from "@nutrition/kitchen/production/application/services/check-production-item.service";

export class CheckProductionItemProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: CheckProductionItemPort,
        useClass: HttpCheckProductionItemAdapter,
      },
      {
        provide: CheckProductionItemService,
        useFactory: (port: CheckProductionItemPort) =>
          new CheckProductionItemService(port),
        deps: [CheckProductionItemPort],
      },
    ];
  }
}
