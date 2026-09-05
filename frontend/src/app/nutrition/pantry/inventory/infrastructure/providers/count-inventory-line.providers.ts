import { Provider } from "@angular/core";
import { CountInventoryLinePort } from "@nutrition/pantry/inventory/domain/ports/count-inventory-line.port";
import { HttpCountInventoryLineAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-count-inventory-line.adapter";
import { CountInventoryLineService } from "@nutrition/pantry/inventory/application/services/count-inventory-line.service";

export class CountInventoryLineProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: CountInventoryLinePort,
        useClass: HttpCountInventoryLineAdapter,
      },
      {
        provide: CountInventoryLineService,
        useFactory: (port: CountInventoryLinePort) =>
          new CountInventoryLineService(port),
        deps: [CountInventoryLinePort],
      },
    ];
  }
}
