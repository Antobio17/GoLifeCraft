import { Provider } from "@angular/core";
import { GetInventoryPort } from "@nutrition/pantry/inventory/domain/ports/get-inventory.port";
import { HttpGetInventoryAdapter } from "@nutrition/pantry/inventory/infrastructure/adapters/http-get-inventory.adapter";
import { GetInventoryService } from "@nutrition/pantry/inventory/application/services/get-inventory.service";

export class GetInventoryProviders {
  static getProviders(): Provider[] {
    return [
      { provide: GetInventoryPort, useClass: HttpGetInventoryAdapter },
      {
        provide: GetInventoryService,
        useFactory: (port: GetInventoryPort) => new GetInventoryService(port),
        deps: [GetInventoryPort],
      },
    ];
  }
}
