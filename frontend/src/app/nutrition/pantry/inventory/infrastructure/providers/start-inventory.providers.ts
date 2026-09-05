import { Provider } from "@angular/core";
import { StartInventoryPort } from "@nutrition/pantry/inventory/domain/ports/start-inventory.port";
import { HttpStartInventoryAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-start-inventory.adapter";
import { StartInventoryService } from "@nutrition/pantry/inventory/application/services/start-inventory.service";

export class StartInventoryProviders {
  static getProviders(): Provider[] {
    return [
      { provide: StartInventoryPort, useClass: HttpStartInventoryAdapter },
      {
        provide: StartInventoryService,
        useFactory: (port: StartInventoryPort) =>
          new StartInventoryService(port),
        deps: [StartInventoryPort],
      },
    ];
  }
}
