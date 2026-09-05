import { Provider } from "@angular/core";
import { DiscardInventoryPort } from "@nutrition/pantry/inventory/domain/ports/discard-inventory.port";
import { HttpDiscardInventoryAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-discard-inventory.adapter";
import { DiscardInventoryService } from "@nutrition/pantry/inventory/application/services/discard-inventory.service";

export class DiscardInventoryProviders {
  static getProviders(): Provider[] {
    return [
      { provide: DiscardInventoryPort, useClass: HttpDiscardInventoryAdapter },
      {
        provide: DiscardInventoryService,
        useFactory: (port: DiscardInventoryPort) =>
          new DiscardInventoryService(port),
        deps: [DiscardInventoryPort],
      },
    ];
  }
}
