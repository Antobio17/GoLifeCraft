import { Provider } from "@angular/core";
import { CountInventoryItemPort } from "@nutrition/pantry/inventory/domain/ports/count-inventory-item.port";
import { HttpCountInventoryItemAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-count-inventory-item.adapter";
import { CountInventoryItemService } from "@nutrition/pantry/inventory/application/services/count-inventory-item.service";

export class CountInventoryItemProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: CountInventoryItemPort,
        useClass: HttpCountInventoryItemAdapter,
      },
      {
        provide: CountInventoryItemService,
        useFactory: (port: CountInventoryItemPort) =>
          new CountInventoryItemService(port),
        deps: [CountInventoryItemPort],
      },
    ];
  }
}
