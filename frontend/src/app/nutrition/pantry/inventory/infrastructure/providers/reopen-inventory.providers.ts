import { Provider } from "@angular/core";
import { ReopenInventoryPort } from "@nutrition/pantry/inventory/domain/ports/reopen-inventory.port";
import { HttpReopenInventoryAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-reopen-inventory.adapter";
import { ReopenInventoryService } from "@nutrition/pantry/inventory/application/services/reopen-inventory.service";

export class ReopenInventoryProviders {
  static getProviders(): Provider[] {
    return [
      {
        provide: ReopenInventoryPort,
        useClass: HttpReopenInventoryAdapter,
      },
      {
        provide: ReopenInventoryService,
        useFactory: (port: ReopenInventoryPort) =>
          new ReopenInventoryService(port),
        deps: [ReopenInventoryPort],
      },
    ];
  }
}
