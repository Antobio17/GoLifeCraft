import { Provider } from "@angular/core";
import { CookProductionItemPort } from "@nutrition/kitchen/production/domain/ports/cook-production-item.port";
import { HttpCookProductionItemAdapter } from "@nutrition/kitchen/production/infrastructure/adapters/http-cook-production-item.adapter";
import { CookProductionItemService } from "@nutrition/kitchen/production/application/services/cook-production-item.service";

export class CookProductionItemProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: CookProductionItemPort,
        useClass: HttpCookProductionItemAdapter,
      },
      {
        provide: CookProductionItemService,
        useFactory: (port: CookProductionItemPort) =>
          new CookProductionItemService(port),
        deps: [CookProductionItemPort],
      },
    ];
  }
}
